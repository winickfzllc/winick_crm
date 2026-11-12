export const dynamic = 'force-dynamic'

import { getSession } from '@/lib/session'
import { createServerClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Contact, Interaction, INTERACTION_LABELS, INTERACTION_ICONS } from '@/lib/types'
import { fullName, formatRelativeDate, formatDate, outreachStatus, daysOverdue } from '@/lib/utils'
import Link from 'next/link'
import { ChevronLeft, Edit, Mail, Phone, Building2, Calendar, ExternalLink } from 'lucide-react'
import ContactDetailClient from './ContactDetailClient'
import FollowUpButton from './FollowUpButton'

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session.userId) redirect('/login')

  const supabase = createServerClient()

  const [{ data: contact }, { data: interactions }, { data: customFields }] = await Promise.all([
    supabase
      .from('contacts')
      .select('*, category:categories(*)')
      .eq('id', id)
      .eq('user_id', session.userId)
      .single(),
    supabase
      .from('interactions')
      .select('*')
      .eq('contact_id', id)
      .order('occurred_at', { ascending: false }),
    supabase
      .from('contact_custom_fields')
      .select('*')
      .eq('contact_id', id),
  ])

  if (!contact) notFound()

  const c = contact as Contact
  const name = fullName(c)
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const bgColor = c.category?.color ?? '#6366f1'
  const status = outreachStatus(c)

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pb-4"
        style={{ paddingTop: 'max(3.5rem, calc(env(safe-area-inset-top) + 1rem))' }}>
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/contacts" className="p-1 text-gray-500">
            <ChevronLeft size={24} />
          </Link>
          <Link href={`/contacts/${id}/edit`}
            className="flex items-center gap-1.5 text-indigo-600 text-sm font-semibold px-3 py-1.5 rounded-lg">
            <Edit size={15} /> Edit
          </Link>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Profile card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
              style={{ backgroundColor: bgColor }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900">{name}</h1>
              {c.job_title && <p className="text-sm text-gray-600">{c.job_title}</p>}
              {c.company && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Building2 size={13} className="text-gray-400" />
                  <p className="text-sm text-gray-500">{c.company}</p>
                </div>
              )}
              {c.category && (
                <span className="inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: bgColor }}>
                  {c.category.name}
                </span>
              )}
            </div>
          </div>

          {/* Status banner */}
          {status === 'overdue' && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm font-semibold text-red-700">
                {c.last_contacted_at ? `${daysOverdue(c)} days overdue` : 'Never been contacted'} — time to reach out!
              </p>
            </div>
          )}
          {status === 'due-soon' && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-sm font-semibold text-amber-700">Coming up for outreach soon</p>
            </div>
          )}
        </div>

        {/* Contact info */}
        {(c.email || c.phone || c.linkedin_url) && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {c.email && (
              <a href={`mailto:${c.email}`} className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 active:bg-gray-50">
                <Mail size={18} className="text-indigo-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-900">{c.email}</p>
                </div>
              </a>
            )}
            {c.phone && (
              <a href={`tel:${c.phone}`} className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 active:bg-gray-50">
                <Phone size={18} className="text-indigo-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{c.phone}</p>
                </div>
              </a>
            )}
            {c.linkedin_url && (
              <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-4 active:bg-gray-50">
                <ExternalLink size={18} className="text-indigo-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">LinkedIn</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {(() => {
                      try {
                        const decoded = decodeURIComponent(c.linkedin_url)
                        const match = decoded.match(/linkedin\.com\/in\/([^/?#]+)/)
                        if (match) {
                          const username = match[1].length > 25 ? match[1].slice(0, 25) + '…' : match[1]
                          return `linkedin.com/in/${username}`
                        }
                        return decoded.replace(/^https?:\/\/(www\.)?/, '')
                      } catch {
                        return c.linkedin_url.replace(/^https?:\/\/(www\.)?/, '')
                      }
                    })()}
                  </p>
                </div>
              </a>
            )}
          </div>
        )}

        {/* Outreach frequency */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Reach out every</span>
            </div>
            <span className="text-sm font-semibold text-indigo-600">
              {c.outreach_frequency_days < 30
                ? `${c.outreach_frequency_days} days`
                : c.outreach_frequency_days < 365
                ? `${Math.round(c.outreach_frequency_days / 30)} month${Math.round(c.outreach_frequency_days / 30) > 1 ? 's' : ''}`
                : `${Math.round(c.outreach_frequency_days / 365)} year`}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">Last contact</span>
            <span className="text-xs font-medium text-gray-600">{formatRelativeDate(c.last_contacted_at)}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <FollowUpButton contactId={id} followUpDate={c.follow_up_date} />
          </div>
        </div>

        {/* Notes */}
        {c.notes && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.notes}</p>
          </div>
        )}

        {/* Custom fields */}
        {customFields && customFields.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Details</h2>
            <div className="space-y-2.5">
              {customFields.map((f: any) => (
                <div key={f.id} className="flex justify-between gap-4">
                  <span className="text-sm text-gray-500">{f.field_key}</span>
                  <span className="text-sm font-medium text-gray-900 text-right">{f.field_value ?? '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interaction timeline — client component for log button */}
        <ContactDetailClient
          contactId={id}
          interactions={(interactions ?? []) as Interaction[]}
        />
      </div>
    </div>
  )
}
