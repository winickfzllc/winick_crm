import { getSession } from '@/lib/session'
import { createServerClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Contact, Category } from '@/lib/types'
import { fullName } from '@/lib/utils'
import ContactForm from '@/components/ContactForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import DeleteContactButton from './DeleteContactButton'

export default async function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session.userId) redirect('/login')

  const supabase = createServerClient()

  const [{ data: contact }, { data: categories }, { data: customFields }] = await Promise.all([
    supabase
      .from('contacts')
      .select('*, category:categories(*)')
      .eq('id', id)
      .eq('user_id', session.userId)
      .single(),
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', session.userId)
      .order('name'),
    supabase
      .from('contact_custom_fields')
      .select('*')
      .eq('contact_id', id),
  ])

  if (!contact) notFound()

  const c = { ...contact, custom_fields: customFields ?? [] } as Contact & { custom_fields: any[] }

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      <div className="bg-white border-b border-gray-100 px-4 pb-4"
        style={{ paddingTop: 'max(3.5rem, calc(env(safe-area-inset-top) + 1rem))' }}>
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href={`/contacts/${id}`} className="p-1 text-gray-500">
              <ChevronLeft size={24} />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{fullName(contact as Contact)}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
        <ContactForm contact={c} categories={(categories ?? []) as Category[]} />

        <div className="pt-2">
          <DeleteContactButton contactId={id} />
        </div>
      </div>
    </div>
  )
}
