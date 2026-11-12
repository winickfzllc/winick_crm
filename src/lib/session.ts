import { getIronSession, SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'
import { Session } from './types'

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'winick-crm-session',
  ttl: 60 * 60 * 24 * 30, // 30 days
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<Session>(cookieStore, sessionOptions)
}
