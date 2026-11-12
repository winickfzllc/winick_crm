'use client'

import { useState, useTransition } from 'react'
import { Category, Contact } from '@/lib/types'
import { createContactAction, updateContactAction } from '@/app/actions/contacts'
import { CATEGORY_COLORS } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'

interface Props {
  categories: Category[]
  contact?: Contact & { custom_fields?: Array<{ field_key: string; field_value: string | null }> }
}

const FREQUENCY_OPTIONS = [
  { label: 'Weekly', days: 7 },
  { label: 'Bi-weekly', days: 14 },
  { label: 'Monthly', days: 30 },
  { label: 'Quarterly', days: 90 },
  { label: 'Bi-annually', days: 180 },
  { label: 'Yearly', days: 365 },
]

export default function ContactForm({ categories, contact }: Props) {
  const isEditing = !!contact
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [customFields, setCustomFields] = useState<Array<{ key: string; value: string }>>(
    contact?.custom_fields?.map(f => ({ key: f.field_key, value: f.field_value ?? '' })) ?? []
  )

  function addField() {
    setCustomFields(prev => [...prev, { key: '', value: '' }])
  }

  function removeField(i: number) {
    setCustomFields(prev => prev.filter((_, idx) => idx !== i))
  }

  function handleSubmit(formData: FormData) {
    // Inject custom fields
    customFields.forEach(f => {
      formData.append('custom_key', f.key)
      formData.append('custom_value', f.value)
    })

    setError('')
    startTransition(async () => {
      const result = isEditing
        ? await updateContactAction(contact!.id, formData)
        : await createContactAction(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {/* Basic info */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Basic Info</h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">First name *</label>
            <input name="first_name" required defaultValue={contact?.first_name}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Last name</label>
            <input name="last_name" defaultValue={contact?.last_name ?? ''}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Company</label>
          <input name="company" defaultValue={contact?.company ?? ''}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Job title</label>
          <input name="job_title" defaultValue={contact?.job_title ?? ''}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
          <input name="email" type="email" defaultValue={contact?.email ?? ''}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
          <input name="phone" type="tel" defaultValue={contact?.phone ?? ''}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">LinkedIn URL</label>
          <input name="linkedin_url" type="url" defaultValue={contact?.linkedin_url ?? ''}
            placeholder="https://linkedin.com/in/..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      {/* Category & frequency */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Organisation</h2>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Category</label>
          <select name="category_id" defaultValue={contact?.category_id ?? ''}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">No category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Reach out every</label>
          <div className="grid grid-cols-3 gap-2">
            {FREQUENCY_OPTIONS.map(opt => (
              <label key={opt.days}
                className="relative cursor-pointer">
                <input type="radio" name="outreach_frequency_days" value={opt.days}
                  defaultChecked={contact
                    ? contact.outreach_frequency_days === opt.days
                    : opt.days === 30}
                  className="sr-only peer" />
                <div className="text-center border-2 border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-600 peer-checked:border-indigo-500 peer-checked:text-indigo-600 peer-checked:bg-indigo-50 transition-colors">
                  {opt.label}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-3">Notes</h2>
        <textarea name="notes" rows={4} defaultValue={contact?.notes ?? ''}
          placeholder="Family details, interests, things to remember when reaching out…"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
      </div>

      {/* Custom fields */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Custom Fields</h2>
          <button type="button" onClick={addField}
            className="flex items-center gap-1 text-xs text-indigo-600 font-medium">
            <Plus size={14} /> Add field
          </button>
        </div>

        {customFields.length === 0 && (
          <p className="text-sm text-gray-400">No custom fields yet. Add things like &quot;Spouse name&quot;, &quot;Hometown&quot;, etc.</p>
        )}

        <div className="space-y-3">
          {customFields.map((field, i) => (
            <div key={i} className="flex gap-2 items-start">
              <input
                placeholder="Label"
                value={field.key}
                onChange={e => setCustomFields(prev => prev.map((f, idx) => idx === i ? { ...f, key: e.target.value } : f))}
                className="w-32 flex-shrink-0 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                placeholder="Value"
                value={field.value}
                onChange={e => setCustomFields(prev => prev.map((f, idx) => idx === i ? { ...f, value: e.target.value } : f))}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button type="button" onClick={() => removeField(i)} className="p-2 text-gray-400">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <button type="submit" disabled={pending}
        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold text-base disabled:opacity-60 shadow-sm">
        {pending ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Contact'}
      </button>
    </form>
  )
}
