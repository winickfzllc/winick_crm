import { getSession } from '@/lib/session'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Contact } from '@/lib/types'
import { outreachStatus, daysOverdue, formatRelativeDate } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'
import ContactCard from '@/components/ContactCard'
import Link from 'next/link'
import { logoutAction } from './actions/auth'
import { LogOut } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session.userId) redirect('/login')

  const supabase = createServerClient()

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*, category:categories(*)')
    .eq('user_id', session.userId)
    .order('first_name')

  const all = (contacts ?? []) as Contact[]

  const overdue = all
    .filter(c => outreachStatus(c) === 'overdue')
    .sort((a, b) => (daysOverdue(b) ?? 0) - (daysOverdue(a) ?? 0))

  const dueSoon = all.filter(c => outreachStatus(c) === 'due-soon')

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 pb-5"
        style={{ paddingTop: 'max(3.5rem, calc(env(safe-area-inset-top) + 1rem))' }}>
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-sm text-gray-500">{greeting}</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-0.5">
              {overdue.length > 0
                ? `${overdue.length} need${overdue.length === 1 ? 's' : ''} attention`
                : 'All caught up!'}
            </h1>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="p-2 text-gray-400">
              <LogOut size={20} />
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{all.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Contacts</p>
          </div>
          <div className="bg-red-50 rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-red-600">{overdue.length}</p>
            <p className="text-xs text-red-500 mt-0.5">Overdue</p>
          </div>
          <div className="bg-amber-50 rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-amber-600">{dueSoon.length}</p>
            <p className="text-xs text-amber-500 mt-0.5">Due soon</p>
          </div>
        </div>

        {/* Overdue contacts */}
        {overdue.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
              Overdue
            </h2>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
              {overdue.map(c => <ContactCard key={c.id} contact={c} />)}
            </div>
          </section>
        )}

        {/* Due soon */}
        {dueSoon.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
              Due this week
            </h2>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
              {dueSoon.map(c => <ContactCard key={c.id} contact={c} />)}
            </div>
          </section>
        )}

        {/* All good / empty */}
        {overdue.length === 0 && dueSoon.length === 0 && all.length > 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">✅</div>
            <p className="font-semibold text-lg text-gray-900">You&apos;re all caught up!</p>
            <p className="text-gray-500 text-sm mt-1">No contacts are due for outreach.</p>
          </div>
        )}

        {all.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">👋</div>
            <p className="font-semibold text-lg text-gray-900">Add your first contact</p>
            <p className="text-gray-500 text-sm mt-1 mb-5">Start building your personal network.</p>
            <Link href="/contacts/new"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold">
              Add Contact
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
