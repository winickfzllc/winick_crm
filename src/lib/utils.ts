import { Contact } from './types'

export function fullName(contact: Pick<Contact, 'first_name' | 'last_name'>): string {
  return [contact.first_name, contact.last_name].filter(Boolean).join(' ')
}

export function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function daysOverdue(contact: Contact): number | null {
  const days = daysSince(contact.last_contacted_at)
  if (days === null) return contact.outreach_frequency_days // never contacted = max overdue
  return days - contact.outreach_frequency_days
}

export function outreachStatus(contact: Contact): 'overdue' | 'due-soon' | 'ok' {
  const overdue = daysOverdue(contact)
  if (overdue === null || overdue > 0) return 'overdue'
  if (overdue > -7) return 'due-soon'
  return 'ok'
}

export function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const days = daysSince(dateStr)
  if (days === null) return 'Never'
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const CATEGORY_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f97316', // orange
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#84cc16', // lime
]
