import { NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/user-auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getUserFromCookies();
  if (!session) return NextResponse.json({ user: null });

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, name: true, phone: true, createdAt: true },
  });
  return NextResponse.json({ user });
}
