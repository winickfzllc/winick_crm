'use server'

import { createServerClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function requireAuth() {
  const session = await getSession()
  if (!session.userId) redirect('/login')
  return session.userId
}

export async function createContactAction(formData: FormData) {
  const userId = await requireAuth()
  const supabase = createServerClient()

  const payload = {
    user_id: userId,
    first_name: formData.get('first_name') as string,
    last_name: (formData.get('last_name') as string) || null,
    company: (formData.get('company') as string) || null,
    job_title: (formData.get('job_title') as string) || null,
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    linkedin_url: (formData.get('linkedin_url') as string) || null,
    notes: (formData.get('notes') as string) || null,
    category_id: (formData.get('category_id') as string) || null,
    outreach_frequency_days: parseInt(formData.get('outreach_frequency_days') as string) || 30,
  }

  const { data, error } = await supabase.from('contacts').insert(payload).select().single()
  if (error) return { error: error.message }

  // Save custom fields
  const customKeys = (formData.getAll('custom_key') as string[]).filter(Boolean)
  const customVals = formData.getAll('custom_value') as string[]
  if (customKeys.length > 0) {
    const fields = customKeys.map((key, i) => ({
      contact_id: data.id,
      field_key: key,
      field_value: customVals[i] || null,
    }))
    await supabase.from('contact_custom_fields').insert(fields)
  }

  revalidatePath('/')
  revalidatePath('/contacts')
  redirect(`/contacts/${data.id}`)
}

export async function updateContactAction(id: string, formData: FormData) {
  const userId = await requireAuth()
  const supabase = createServerClient()

  const payload = {
    first_name: formData.get('first_name') as string,
    last_name: (formData.get('last_name') as string) || null,
    company: (formData.get('company') as string) || null,
    job_title: (formData.get('job_title') as string) || null,
    email: (formData.get('email') as string) || null,
    phone: (formData.get('phone') as string) || null,
    linkedin_url: (formData.get('linkedin_url') as string) || null,
    notes: (formData.get('notes') as string) || null,
    category_id: (formData.get('category_id') as string) || null,
    outreach_frequency_days: parseInt(formData.get('outreach_frequency_days') as string) || 30,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('contacts')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return { error: error.message }

  // Replace custom fields
  await supabase.from('contact_custom_fields').delete().eq('contact_id', id)
  const customKeys = (formData.getAll('custom_key') as string[]).filter(Boolean)
  const customVals = formData.getAll('custom_value') as string[]
  if (customKeys.length > 0) {
    const fields = customKeys.map((key, i) => ({
      contact_id: id,
      field_key: key,
      field_value: customVals[i] || null,
    }))
    await supabase.from('contact_custom_fields').insert(fields)
  }

  revalidatePath('/')
  revalidatePath('/contacts')
  revalidatePath(`/contacts/${id}`)
  redirect(`/contacts/${id}`)
}

export async function deleteContactAction(id: string) {
  const userId = await requireAuth()
  const supabase = createServerClient()

  await supabase.from('contacts').delete().eq('id', id).eq('user_id', userId)

  revalidatePath('/')
  revalidatePath('/contacts')
  redirect('/contacts')
}

export async function logInteractionAction(formData: FormData) {
  const userId = await requireAuth()
  const supabase = createServerClient()

  const contactId = formData.get('contact_id') as string
  const occurredAt = (formData.get('occurred_at') as string) || new Date().toISOString()

  await supabase.from('interactions').insert({
    contact_id: contactId,
    user_id: userId,
    type: formData.get('type') as string,
    notes: (formData.get('notes') as string) || null,
    occurred_at: occurredAt,
  })

  // Update last_contacted_at on the contact
  await supabase
    .from('contacts')
    .update({ last_contacted_at: occurredAt, updated_at: new Date().toISOString() })
    .eq('id', contactId)
    .eq('user_id', userId)

  revalidatePath('/')
  revalidatePath('/contacts')
  revalidatePath(`/contacts/${contactId}`)
}

export async function updateInteractionAction(id: string, contactId: string, formData: FormData) {
  const userId = await requireAuth()
  const supabase = createServerClient()

  const occurredAt = (formData.get('occurred_at') as string) || new Date().toISOString()

  await supabase
    .from('interactions')
    .update({
      type: formData.get('type') as string,
      notes: (formData.get('notes') as string) || null,
      occurred_at: occurredAt,
    })
    .eq('id', id)
    .eq('user_id', userId)

  // Recalculate last_contacted_at
  const { data: latest } = await supabase
    .from('interactions')
    .select('occurred_at')
    .eq('contact_id', contactId)
    .order('occurred_at', { ascending: false })
    .limit(1)
    .single()

  await supabase
    .from('contacts')
    .update({
      last_contacted_at: latest?.occurred_at ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', contactId)
    .eq('user_id', userId)

  revalidatePath('/')
  revalidatePath(`/contacts/${contactId}`)
}

export async function deleteInteractionAction(id: string, contactId: string) {
  const userId = await requireAuth()
  const supabase = createServerClient()

  await supabase.from('interactions').delete().eq('id', id).eq('user_id', userId)

  // Recalculate last_contacted_at
  const { data: latest } = await supabase
    .from('interactions')
    .select('occurred_at')
    .eq('contact_id', contactId)
    .order('occurred_at', { ascending: false })
    .limit(1)
    .single()

  await supabase
    .from('contacts')
    .update({
      last_contacted_at: latest?.occurred_at ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', contactId)
    .eq('user_id', userId)

  revalidatePath('/')
  revalidatePath(`/contacts/${contactId}`)
}
