export const dynamic = 'force-dynamic'

import { getSession } from '@/lib/session'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Contact, Category } from '@/lib/types'
import BottomNav from '@/components/BottomNav'
import ContactCard from '@/components/ContactCard'
import Link from 'next/link'
import { Search } from 'lucide-react'
import ContactsClient from './ContactsClient'

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; filter?: string }>
}) {
  const session = await getSession()
  if (!session.userId) redirect('/login')

  const params = await searchParams
  const supabase = createServerClient()

  const [{ data: contacts }, { data: categories }] = await Promise.all([
    supabase
      .from('contacts')
      .select('*, category:categories(*)')
      .eq('user_id', session.userId)
      .order('first_name'),
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', session.userId)
      .order('name'),
  ])

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 pb-4"
        style={{ paddingTop: 'max(3.5rem, calc(env(safe-area-inset-top) + 1rem))' }}>
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
            <Link href="/contacts/new"
              className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl">
              + Add
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        <ContactsClient
          contacts={(contacts ?? []) as Contact[]}
          categories={(categories ?? []) as Category[]}
          initialCategory={params.category}
          initialQuery={params.q}
          initialFilter={params.filter}
        />
      </div>

      <BottomNav />
    </div>
  )
}
