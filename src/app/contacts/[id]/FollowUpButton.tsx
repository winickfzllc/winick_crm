'use client'

import { useState, useTransition } from 'react'
import { setFollowUpAction } from '@/app/actions/contacts'
import { Bell, BellOff, X } from 'lucide-react'

interface Props {
  contactId: string
  followUpDate: string | null
}

export default function FollowUpButton({ contactId, followUpDate }: Props) {
  const [showPicker, setShowPicker] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleSet(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const date = fd.get('follow_up_date') as string
    if (!date) return
    startTransition(async () => {
      await setFollowUpAction(contactId, date)
      setShowPicker(false)
    })
  }

  function handleClear() {
    startTransition(() => setFollowUpAction(contactId, null))
  }

  if (followUpDate) {
    const display = new Date(followUpDate + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Dubai',
    })
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-indigo-500 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400">Follow-up reminder</p>
            <p className="text-sm font-semibold text-indigo-600">{display}</p>
          </div>
        </div>
        <button onClick={handleClear} disabled={pending}
          className="p-1.5 text-gray-400 hover:text-red-400 disabled:opacity-40">
          <X size={16} />
        </button>
      </div>
    )
  }

  return (
    <div>
      {!showPicker ? (
        <button onClick={() => setShowPicker(true)}
          className="flex items-center gap-2 text-sm text-indigo-500 font-medium">
          <Bell size={16} />
          Set follow-up reminder
        </button>
      ) : (
        <form onSubmit={handleSet} className="flex items-center gap-2">
          <Bell size={16} className="text-gray-400 flex-shrink-0" />
          <input
            type="date"
            name="follow_up_date"
            required
            autoFocus
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" disabled={pending}
            className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold disabled:opacity-60">
            Set
          </button>
          <button type="button" onClick={() => setShowPicker(false)}
            className="p-2 text-gray-400">
            <X size={16} />
          </button>
        </form>
      )}
    </div>
  )
}
