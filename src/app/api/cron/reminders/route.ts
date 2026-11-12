import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import * as webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()

  const todayGST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai' }).format(new Date())

  // Contacts with follow-up due today or overdue
  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, follow_up_date, last_contacted_at, outreach_frequency_days, user_id')

  if (!contacts?.length) return NextResponse.json({ sent: 0 })

  // Group notifications by user
  const byUser: Record<string, { followUps: string[], overdue: string[] }> = {}

  for (const c of contacts) {
    if (!byUser[c.user_id]) byUser[c.user_id] = { followUps: [], overdue: [] }
    const name = [c.first_name, c.last_name].filter(Boolean).join(' ')

    if (c.follow_up_date && c.follow_up_date <= todayGST) {
      byUser[c.user_id].followUps.push(name)
    } else if (!c.follow_up_date) {
      // Check overdue
      if (!c.last_contacted_at) {
        // never contacted — skip, already shows as due-soon
      } else {
        const daysSince = Math.floor((Date.now() - new Date(c.last_contacted_at).getTime()) / 86400000)
        if (daysSince > c.outreach_frequency_days) {
          byUser[c.user_id].overdue.push(name)
        }
      }
    }
  }

  let sent = 0

  for (const [userId, { followUps, overdue }] of Object.entries(byUser)) {
    const messages: Array<{ title: string; body: string; url: string }> = []

    if (followUps.length === 1) {
      messages.push({ title: 'Follow-up reminder', body: `Time to follow up with ${followUps[0]}`, url: '/' })
    } else if (followUps.length > 1) {
      messages.push({ title: `${followUps.length} follow-ups due`, body: followUps.join(', '), url: '/' })
    }

    if (overdue.length === 1) {
      messages.push({ title: 'Overdue outreach', body: `${overdue[0]} is overdue for a catch-up`, url: '/?filter=overdue' })
    } else if (overdue.length > 1) {
      messages.push({ title: `${overdue.length} contacts overdue`, body: overdue.slice(0, 3).join(', ') + (overdue.length > 3 ? '…' : ''), url: '/' })
    }

    if (!messages.length) continue

    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', userId)

    for (const sub of subs ?? []) {
      for (const msg of messages) {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify(msg),
          )
          sent++
        } catch {
          // Subscription expired — clean it up
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        }
      }
    }
  }

  return NextResponse.json({ sent })
}
