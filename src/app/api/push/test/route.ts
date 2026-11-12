import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { createServerClient } from '@/lib/supabase/server'
import * as webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function POST() {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerClient()
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', session.userId)

  if (!subs?.length) return NextResponse.json({ error: 'No subscriptions found — make sure you allowed notifications in the app' }, { status: 404 })

  for (const sub of subs) {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify({ title: 'Winick CRM', body: '🔔 Test notification — it\'s working!', url: '/' }),
    )
  }

  return NextResponse.json({ ok: true })
}
