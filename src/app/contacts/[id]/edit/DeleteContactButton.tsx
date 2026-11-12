'use client'

import { useState, useTransition } from 'react'
import { deleteContactAction } from '@/app/actions/contacts'
import { Trash2 } from 'lucide-react'

export default function DeleteContactButton({ contactId }: { contactId: string }) {
  const [confirm, setConfirm] = useState(false)
  const [pending, startTransition] = useTransition()

  if (!confirm) {
    return (
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="w-full text-red-500 border border-red-200 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
        <Trash2 size={16} /> Delete Contact
      </button>
    )
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
      <p className="text-sm font-semibold text-red-800 mb-1">Delete this contact?</p>
      <p className="text-xs text-red-600 mb-4">This will permanently delete all interactions and data. This cannot be undone.</p>
      <div className="flex gap-3">
        <button onClick={() => setConfirm(false)}
          className="flex-1 border border-gray-300 py-2.5 rounded-xl text-sm font-medium text-gray-700">
          Cancel
        </button>
        <button
          disabled={pending}
          onClick={() => startTransition(() => deleteContactAction(contactId))}
          className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">
          {pending ? 'Deleting…' : 'Yes, Delete'}
        </button>
      </div>
    </div>
  )
}
