import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { signUserToken } from '@/lib/user-auth'

export async function GET(req: NextRequest) {
  const code        = req.nextUrl.searchParams.get('code')
  const origin      = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const redirectUri = `${origin}/api/user/auth/google/callback`

  if (!code) return NextResponse.redirect(new URL('/?auth_error=missing_code', req.url))

  try {
    /* Exchange code for tokens */
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri:  redirectUri,
        grant_type:    'authorization_code',
      }),
    })
    const tokens = await tokenRes.json()
    if (!tokenRes.ok) throw new Error(tokens.error_description ?? tokens.error)

    /* Get Google profile */
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const profile = await profileRes.json()
    if (!profile.email) throw new Error('No email returned from Google')

    /* Upsert user — Google OAuth accounts are auto-verified */
    const user = await prisma.user.upsert({
      where:  { email: profile.email },
      update: { name: profile.name ?? undefined, emailVerified: true },
      create: {
        email:         profile.email,
        name:          profile.name ?? profile.email.split('@')[0],
        emailVerified: true,
        password:      '',
      },
    })

    /* Create session JWT + set cookie */
    const token = await signUserToken({
      id:    user.id,
      email: user.email,
      name:  user.name ?? '',
    })

    const res = NextResponse.redirect(new URL('/', req.url))
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    res.cookies.set('user_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires:  expiresAt,
      path:     '/',
    })
    return res
  } catch (err) {
    console.error('[Google OAuth]', err)
    return NextResponse.redirect(new URL('/?auth_error=1', req.url))
  }
}
