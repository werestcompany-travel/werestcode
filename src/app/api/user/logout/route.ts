import { NextResponse } from 'next/server';

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('user_token', '', { path: '/', maxAge: 0 });
  return res;
}
