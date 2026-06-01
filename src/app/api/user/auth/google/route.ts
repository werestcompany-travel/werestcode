import { NextResponse } from 'next/server'

export function GET() {
  const clientId    = process.env.GOOGLE_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/user/auth/google/callback`

  if (!clientId) {
    return NextResponse.json({ error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID in .env' }, { status: 503 })
  }

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'offline',
    prompt:        'select_account',
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}
