import Link from 'next/link'
import { Contact } from '@/lib/types'
import { fullName, formatRelativeDate, outreachStatus, daysOverdue } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

interface Props {
  contact: Contact
  showCategory?: boolean
}

export default function ContactCard({ contact, showCategory = true }: Props) {
  const status = outreachStatus(contact)
  const overdue = daysOverdue(contact)
  const name = fullName(contact)
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const bgColor = contact.category?.color ?? '#6366f1'

  return (
    <Link href={`/contacts/${contact.id}`}
      className="flex items-center gap-3 bg-white p-4 active:bg-gray-50 transition-colors">
      {/* Avatar */}
      <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold"
        style={{ backgroundColor: bgColor }}>
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-gray-900 truncate">{name}</p>
          {status === 'overdue' && (
            <span className="ml-2 flex-shrink-0 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              {overdue !== null && overdue > 0 ? `${overdue}d late` : 'Never contacted'}
            </span>
          )}
          {status === 'due-soon' && (
            <span className="ml-2 flex-shrink-0 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Due soon
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {contact.company && (
            <p className="text-sm text-gray-500 truncate">{contact.company}</p>
          )}
          {showCategory && contact.category && (
            <>
              {contact.company && <span className="text-gray-300">·</span>}
              <span className="text-xs font-medium truncate" style={{ color: contact.category.color }}>
                {contact.category.name}
              </span>
            </>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Last contact: {formatRelativeDate(contact.last_contacted_at)}
        </p>
      </div>

      <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
    </Link>
  )
}
