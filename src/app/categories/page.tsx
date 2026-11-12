export const dynamic = 'force-dynamic'

import { getSession } from '@/lib/session'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Category } from '@/lib/types'
import BottomNav from '@/components/BottomNav'
import CategoriesClient from './CategoriesClient'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function CategoriesPage() {
  const session = await getSession()
  if (!session.userId) redirect('/login')

  const supabase = createServerClient()

  const [{ data: categories }, { data: contactCounts }] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', session.userId)
      .order('name'),
    supabase
      .from('contacts')
      .select('category_id')
      .eq('user_id', session.userId),
  ])

  const countMap = (contactCounts ?? []).reduce<Record<string, number>>((acc, c) => {
    if (c.category_id) acc[c.category_id] = (acc[c.category_id] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      <div className="bg-white border-b border-gray-100 px-4 pb-4"
        style={{ paddingTop: 'max(3.5rem, calc(env(safe-area-inset-top) + 1rem))' }}>
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/contacts" className="p-1 text-gray-500">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Categories</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5">
        <CategoriesClient
          categories={(categories ?? []) as Category[]}
          contactCounts={countMap}
        />
      </div>

      <BottomNav />
    </div>
  )
}
