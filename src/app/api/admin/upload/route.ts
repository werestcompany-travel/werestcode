export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromCookies } from '@/lib/auth';

const MAX_SIZE_MB   = 8;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: NextRequest) {
  /* ── Auth ── */
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({
      error: 'Cloudinary not configured',
      setup: [
        '1. Go to https://cloudinary.com and create a free account',
        '2. Copy your Cloud Name, API Key, and API Secret from the dashboard',
        '3. Add them to your .env.local (and Vercel env vars for production):',
        '   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name',
        '   CLOUDINARY_API_KEY=your_api_key',
        '   CLOUDINARY_API_SECRET=your_api_secret',
        '4. In Cloudinary: Settings → Upload → Add upload preset → name it "werest_unsigned" → set to Unsigned',
      ],
    }, { status: 503 });
  }

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

    /* ── Signed upload to Cloudinary ── */
    const timestamp = Math.round(Date.now() / 1000);
    const folder    = 'werest';

    const crypto = await import('crypto');
    const sigStr  = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(sigStr).digest('hex');

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('api_key', apiKey);
    uploadData.append('timestamp', timestamp.toString());
    uploadData.append('signature', signature);
    uploadData.append('folder', folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: uploadData }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('[upload] Cloudinary error:', err);
      return NextResponse.json({ error: 'Upload failed' }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({
      success:  true,
      url:      data.secure_url,
      publicId: data.public_id,
    });
  } catch (err) {
    console.error('[upload] error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
