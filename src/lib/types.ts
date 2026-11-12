export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface Contact {
  id: string
  user_id: string
  category_id: string | null
  first_name: string
  last_name: string | null
  company: string | null
  job_title: string | null
  email: string | null
  phone: string | null
  linkedin_url: string | null
  notes: string | null
  outreach_frequency_days: number
  last_contacted_at: string | null
  created_at: string
  updated_at: string
  category?: Category
  interactions?: Interaction[]
  custom_fields?: CustomField[]
}

export interface Interaction {
  id: string
  contact_id: string
  user_id: string
  type: InteractionType
  notes: string | null
  occurred_at: string
  created_at: string
}

export type InteractionType = 'call' | 'email' | 'text' | 'coffee' | 'linkedin' | 'meeting' | 'other'

export const INTERACTION_LABELS: Record<InteractionType, string> = {
  call: 'Phone Call',
  email: 'Email',
  text: 'Text/WhatsApp',
  coffee: 'Coffee/Lunch',
  linkedin: 'LinkedIn',
  meeting: 'Meeting',
  other: 'Other',
}

export const INTERACTION_ICONS: Record<InteractionType, string> = {
  call: '📞',
  email: '✉️',
  text: '💬',
  coffee: '☕',
  linkedin: '💼',
  meeting: '🤝',
  other: '📝',
}

export interface CustomField {
  id: string
  contact_id: string
  field_key: string
  field_value: string | null
}

export interface Session {
  userId: string
  email: string
}
