'use client'

import { useState, useTransition } from 'react'
import { Category } from '@/lib/types'
import { CATEGORY_COLORS } from '@/lib/utils'
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from '@/app/actions/categories'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'

interface Props {
  categories: Category[]
  contactCounts: Record<string, number>
}

export default function CategoriesClient({ categories, contactCounts }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [pending, startTransition] = useTransition()

  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(CATEGORY_COLORS[0])
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  function startEdit(cat: Category) {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditColor(cat.color)
  }

  function handleCreate() {
    if (!newName.trim()) return
    const fd = new FormData()
    fd.set('name', newName)
    fd.set('color', newColor)
    startTransition(async () => {
      await createCategoryAction(fd)
      setIsAdding(false)
      setNewName('')
      setNewColor(CATEGORY_COLORS[0])
    })
  }

  function handleUpdate(id: string) {
    if (!editName.trim()) return
    const fd = new FormData()
    fd.set('name', editName)
    fd.set('color', editColor)
    startTransition(async () => {
      await updateCategoryAction(id, fd)
      setEditingId(null)
    })
  }

  function handleDelete(id: string) {
    startTransition(() => deleteCategoryAction(id))
  }

  return (
    <div className="space-y-4">
      {/* Category list */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
        {categories.length === 0 && !isAdding && (
          <div className="text-center py-10 px-4">
            <p className="text-gray-500 text-sm">No categories yet.</p>
            <p className="text-gray-400 text-xs mt-1">Create categories like Friends, Work, LinkedIn…</p>
          </div>
        )}

        {categories.map(cat => (
          <div key={cat.id} className="px-4 py-3.5">
            {editingId === cat.id ? (
              <div className="space-y-3">
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <div className="flex gap-2 flex-wrap">
                  {CATEGORY_COLORS.map(color => (
                    <button key={color} type="button"
                      onClick={() => setEditColor(color)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-transform"
                      style={{ backgroundColor: color, transform: editColor === color ? 'scale(1.2)' : 'scale(1)' }}>
                      {editColor === color && <Check size={12} className="text-white" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingId(null)}
                    className="flex-1 border border-gray-200 py-2 rounded-xl text-sm text-gray-600">
                    Cancel
                  </button>
                  <button onClick={() => handleUpdate(cat.id)} disabled={pending}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-semibold disabled:opacity-60">
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                  <p className="text-xs text-gray-400">{contactCounts[cat.id] ?? 0} contacts</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(cat)} className="p-2 text-gray-400">
                    <Pencil size={15} />
                  </button>
                  {(contactCounts[cat.id] ?? 0) === 0 && (
                    <button onClick={() => handleDelete(cat.id)} disabled={pending}
                      className="p-2 text-gray-400 hover:text-red-400">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* New category form inline */}
        {isAdding && (
          <div className="px-4 py-3.5 space-y-3">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Category name"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <div className="flex gap-2 flex-wrap">
              {CATEGORY_COLORS.map(color => (
                <button key={color} type="button"
                  onClick={() => setNewColor(color)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform"
                  style={{ backgroundColor: color, transform: newColor === color ? 'scale(1.2)' : 'scale(1)' }}>
                  {newColor === color && <Check size={12} className="text-white" strokeWidth={3} />}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsAdding(false)}
                className="flex-1 border border-gray-200 py-2 rounded-xl text-sm text-gray-600">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={pending || !newName.trim()}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-semibold disabled:opacity-60">
                {pending ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        )}
      </div>

      {!isAdding && (
        <button onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-2xl py-4 text-sm font-semibold active:bg-indigo-700">
          <Plus size={18} /> Add Category
        </button>
      )}
    </div>
  )
}
