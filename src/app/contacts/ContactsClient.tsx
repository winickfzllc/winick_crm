'use client'

import { useState, useMemo } from 'react'
import { Contact, Category } from '@/lib/types'
import { fullName, outreachStatus } from '@/lib/utils'
import ContactCard from '@/components/ContactCard'
import { Search, X } from 'lucide-react'
import Link from 'next/link'

interface Props {
  contacts: Contact[]
  categories: Category[]
  initialCategory?: string
  initialQuery?: string
  initialFilter?: string
}

export default function ContactsClient({ contacts, categories, initialCategory, initialQuery, initialFilter }: Props) {
  const [query, setQuery] = useState(initialQuery ?? '')
  const [categoryId, setCategoryId] = useState(initialCategory ?? '')
  const [statusFilter] = useState(initialFilter ?? '')

  const filtered = useMemo(() => {
    return contacts.filter(c => {
      const matchesQuery = !query ||
        fullName(c).toLowerCase().includes(query.toLowerCase()) ||
        c.company?.toLowerCase().includes(query.toLowerCase()) ||
        c.email?.toLowerCase().includes(query.toLowerCase())
      const matchesCat = !categoryId || c.category_id === categoryId
      const matchesStatus = !statusFilter || outreachStatus(c) === statusFilter
      return matchesQuery && matchesCat && matchesStatus
    })
  }, [contacts, query, categoryId, statusFilter])

  return (
    <div>
      {/* Status filter banner */}
      {statusFilter && (
        <div className={`mx-4 mt-3 px-4 py-2 rounded-xl text-sm font-medium ${
          statusFilter === 'overdue'
            ? 'bg-red-50 text-red-700'
            : 'bg-amber-50 text-amber-700'
        }`}>
          Showing: {statusFilter === 'overdue' ? 'Overdue contacts' : 'Due soon contacts'}
        </div>
      )}

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search contacts…"
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Category filter chips */}
      <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {categories.length > 0 && (
          <button
            onClick={() => setCategoryId('')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              !categoryId ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'
            }`}>
            All
          </button>
        )}
        {categories.map(cat => (
          <button key={cat.id}
            onClick={() => setCategoryId(categoryId === cat.id ? '' : cat.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              categoryId === cat.id ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200'
            }`}
            style={categoryId === cat.id ? { backgroundColor: cat.color, borderColor: cat.color } : {}}>
            {cat.name}
          </button>
        ))}
        <Link href="/categories"
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-gray-300 text-gray-400">
          {categories.length === 0 ? '+ Add categories' : 'Manage'}
        </Link>
      </div>

      {/* Contact list */}
      {filtered.length > 0 ? (
        <div className="bg-white mx-4 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
          {filtered.map(c => <ContactCard key={c.id} contact={c} />)}
        </div>
      ) : (
        <div className="text-center py-16 px-4">
          {contacts.length === 0 ? (
            <>
              <div className="text-5xl mb-3">📇</div>
              <p className="font-semibold text-gray-900">No contacts yet</p>
              <p className="text-gray-500 text-sm mt-1 mb-5">Add people you want to stay in touch with.</p>
              <Link href="/contacts/new"
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold text-sm">
                Add First Contact
              </Link>
            </>
          ) : (
            <>
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-semibold text-gray-900">No results</p>
              <p className="text-gray-500 text-sm mt-1">Try a different search or filter.</p>
            </>
          )}
        </div>
      )}

      <div className="h-4" />
    </div>
  )
}
