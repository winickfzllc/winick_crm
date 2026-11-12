'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'

type State = 'loading' | 'unsupported' | 'prompt' | 'subscribing' | 'subscribed' | 'denied'

export default function PushSetup() {
  const [state, setState] = useState<State>('loading')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported')
      return
    }
    if (Notification.permission === 'denied') { setState('denied'); return }

    navigator.serviceWorker.register('/sw.js').then(async (reg) => {
      const existing = await reg.pushManager.getSubscription()
      if (existing) { setState('subscribed'); return }
      setState(Notification.permission === 'granted' ? 'prompt' : 'prompt')
    })
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

  if (state === 'loading' || state === 'unsupported' || state === 'subscribed') return null

  if (state === 'denied') return (
    <p className="text-xs text-gray-400 flex items-center gap-1.5">
      <BellOff size={13} /> Notifications blocked — enable in iOS Settings
    </p>
  )

  return (
    <button onClick={enable} disabled={state === 'subscribing'}
      className="flex items-center gap-1.5 text-xs font-medium text-indigo-500 disabled:opacity-60">
      <Bell size={13} />
      {state === 'subscribing' ? 'Setting up…' : 'Enable notifications'}
    </button>
  )
}
