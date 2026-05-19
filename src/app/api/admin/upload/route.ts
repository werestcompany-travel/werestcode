import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromCookies } from '@/lib/auth';

export const config = { api: { bodyParser: false } };

const MAX_SIZE_MB = 8;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: NextRequest) {
  /* ── Auth ── */
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    /* ── Validate type ── */
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.map(t => t.split('/')[1]).join(', ')}` },
        { status: 400 },
      );
    }

    /* ── Validate size ── */
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ error: `File too large. Max size is ${MAX_SIZE_MB}MB` }, { status: 400 });
    }

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    /* ── Generate safe filename ── */
    const ext      = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const safeName = `blog-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    /* ── Try Vercel Blob (production) first ── */
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import('@vercel/blob');
      const blob = await put(`blog/${safeName}`, buffer, {
        access: 'public',
        contentType: file.type,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      return NextResponse.json({ url: blob.url });
    }

    /* ── Fallback: save to public/uploads/blog/ (local dev) ── */
    const { writeFile } = await import('fs/promises');
    const { join }      = await import('path');
    const uploadDir     = join(process.cwd(), 'public', 'uploads', 'blog');

    // Ensure directory exists
    const { mkdir } = await import('fs/promises');
    await mkdir(uploadDir, { recursive: true });

    await writeFile(join(uploadDir, safeName), buffer);
    const url = `/uploads/blog/${safeName}`;

    return NextResponse.json({ url });
  } catch (err) {
    console.error('[upload]', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
