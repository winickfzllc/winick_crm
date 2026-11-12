import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { Session } from '@/lib/types'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/login') || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const response = NextResponse.next()
  const session = await getIronSession<Session>(request.cookies as any, {
    password: process.env.SESSION_SECRET!,
    cookieName: 'winick-crm-session',
  })

  if (!session.userId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json).*)'],
}
