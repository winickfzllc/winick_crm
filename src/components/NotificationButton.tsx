'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'

type State = 'loading' | 'unsupported' | 'prompt' | 'subscribing' | 'subscribed' | 'denied' | 'sending' | 'sent' | 'failed'

export default function NotificationButton() {
  const [state, setState] = useState<State>('loading')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported')
      return
    }
    if (Notification.permission === 'denied') { setState('denied'); return }

    navigator.serviceWorker.register('/sw.js').then(async (reg) => {
      const existing = await reg.pushManager.getSubscription()
      setState(existing ? 'subscribed' : 'prompt')
    }).catch(() => setState('unsupported'))
  }, [])

  async function enable() {
    setState('subscribing')
    try {
      const reg = await navigator.serviceWorker.ready
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setState('denied'); return }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })
      setState(res.ok ? 'subscribed' : 'prompt')
    } catch {
      setState('prompt')
    }
  }

  async function test() {
    setState('sending')
    const res = await fetch('/api/push/test', { method: 'POST' })
    setState(res.ok ? 'sent' : 'failed')
    setTimeout(() => setState('subscribed'), 3000)
  }

  if (state === 'loading' || state === 'unsupported') return null

  if (state === 'denied') return (
    <span className="text-xs text-gray-400">Notifications blocked in Settings</span>
  )

  if (state === 'prompt') return (
    <button onClick={enable} className="flex items-center gap-1.5 text-xs font-medium text-indigo-500">
      <Bell size={13} /> Enable notifications
    </button>
  )

  if (state === 'subscribing') return (
    <span className="text-xs text-gray-400">Setting up…</span>
  )

  if (state === 'subscribed') return (
    <button onClick={test} className="flex items-center gap-1.5 text-xs text-gray-400">
      <Bell size={13} /> Test notification
    </button>
  )

  if (state === 'sending') return <span className="text-xs text-gray-400">Sending…</span>
  if (state === 'sent') return <span className="text-xs text-green-500">✓ Check your phone!</span>
  if (state === 'failed') return <span className="text-xs text-red-400">Failed — try again</span>

  return null
}
