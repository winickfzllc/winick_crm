'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'

export default function TestNotificationButton() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')

  async function send() {
    setStatus('sending')
    const res = await fetch('/api/push/test', { method: 'POST' })
    setStatus(res.ok ? 'ok' : 'error')
    setTimeout(() => setStatus('idle'), 3000)
  }

  return (
    <button onClick={send} disabled={status === 'sending'}
      className="flex items-center gap-2 text-xs text-gray-400 disabled:opacity-50">
      <Bell size={13} />
      {status === 'idle' && 'Test notification'}
      {status === 'sending' && 'Sending…'}
      {status === 'ok' && '✓ Sent!'}
      {status === 'error' && 'Failed — allow notifications first'}
    </button>
  )
}
