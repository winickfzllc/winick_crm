'use client'

import { useState, useTransition } from 'react'
import { Interaction, INTERACTION_LABELS, INTERACTION_ICONS } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { deleteInteractionAction } from '@/app/actions/contacts'
import LogInteractionModal from '@/components/LogInteractionModal'
import { Plus, Trash2, Pencil, MessageCircle } from 'lucide-react'

interface Props {
  contactId: string
  interactions: Interaction[]
}

export default function ContactDetailClient({ contactId, interactions }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleDelete(id: string) {
    setDeletingId(id)
    startTransition(async () => {
      await deleteInteractionAction(id, contactId)
      setDeletingId(null)
    })
  }

  function handleEdit(interaction: Interaction) {
    setEditingInteraction(interaction)
    setShowModal(true)
  }

  function handleClose() {
    setShowModal(false)
    setEditingInteraction(null)
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Interaction Log</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600">
            <Plus size={14} /> Log
          </button>
        </div>

        {interactions.length === 0 ? (
          <div className="text-center py-6">
            <MessageCircle size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No interactions logged yet.</p>
            <button onClick={() => setShowModal(true)}
              className="mt-3 text-sm font-semibold text-indigo-600">
              Log first interaction
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {interactions.map(interaction => (
              <div key={interaction.id} className="flex gap-3">
                <div className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-xl flex-shrink-0 text-lg">
                  {INTERACTION_ICONS[interaction.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{INTERACTION_LABELS[interaction.type]}</p>
                      <p className="text-xs text-gray-400">{formatDate(interaction.occurred_at)}</p>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(interaction)}
                        className="p-1.5 text-gray-400 hover:text-indigo-500">
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(interaction.id)}
                        disabled={deletingId === interaction.id}
                        className="p-1.5 text-gray-400 hover:text-red-400 disabled:opacity-40">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  {interaction.notes && (
                    <p className="text-sm text-gray-600 mt-1">{interaction.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating log button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white z-40"
        style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
        <Plus size={24} />
      </button>

      {showModal && (
        <LogInteractionModal
          contactId={contactId}
          onClose={handleClose}
          interaction={editingInteraction ?? undefined}
        />
      )}
    </>
  )
}
