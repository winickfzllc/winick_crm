'use client'

import { useState, useTransition } from 'react'
import { logInteractionAction, updateInteractionAction } from '@/app/actions/contacts'
import { INTERACTION_LABELS, INTERACTION_ICONS, InteractionType, Interaction } from '@/lib/types'
import { X } from 'lucide-react'

interface Props {
  contactId: string
  onClose: () => void
  interaction?: Interaction
}

const TYPES = Object.keys(INTERACTION_LABELS) as InteractionType[]

const TZ = 'Asia/Dubai'

function toDatetimeInputValue(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(date)
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00'
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`
}

export default function LogInteractionModal({ contactId, onClose, interaction }: Props) {
  const isEditing = !!interaction
  const [type, setType] = useState<InteractionType>((interaction?.type as InteractionType) ?? 'call')
  const [pending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (isEditing) {
        await updateInteractionAction(interaction!.id, contactId, formData)
      } else {
        await logInteractionAction(formData)
      }
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div className="bg-white w-full rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            {isEditing ? 'Edit Interaction' : 'Log Interaction'}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form action={handleSubmit}>
          <input type="hidden" name="contact_id" value={contactId} />

          {/* Type selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map(t => (
                <button key={t} type="button"
                  onClick={() => setType(t)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-sm transition-colors ${
                    type === t
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600'
                  }`}>
                  <span className="text-xl">{INTERACTION_ICONS[t]}</span>
                  <span className="text-xs">{INTERACTION_LABELS[t]}</span>
                </button>
              ))}
            </div>
            <input type="hidden" name="type" value={type} />
          </div>

          {/* Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="datetime-local"
              name="occurred_at"
              defaultValue={
                interaction
                  ? toDatetimeInputValue(new Date(interaction.occurred_at))
                  : toDatetimeInputValue(new Date())
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={interaction?.notes ?? ''}
              placeholder="What did you talk about?"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold text-base disabled:opacity-60">
            {pending ? 'Saving…' : isEditing ? 'Save Changes' : 'Save Interaction'}
          </button>
        </form>
      </div>
    </div>
  )
}
