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

export async function createCategoryAction(formData: FormData) {
  const userId = await requireAuth()
  const supabase = createServerClient()

  const { error } = await supabase.from('categories').insert({
    user_id: userId,
    name: formData.get('name') as string,
    color: (formData.get('color') as string) || '#6366f1',
  })

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/contacts')
  revalidatePath('/categories')
}

export async function updateCategoryAction(id: string, formData: FormData) {
  const userId = await requireAuth()
  const supabase = createServerClient()

  const { error } = await supabase
    .from('categories')
    .update({
      name: formData.get('name') as string,
      color: formData.get('color') as string,
    })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/contacts')
  revalidatePath('/categories')
}

export async function deleteCategoryAction(id: string) {
  const userId = await requireAuth()
  const supabase = createServerClient()

  await supabase.from('categories').delete().eq('id', id).eq('user_id', userId)

  revalidatePath('/')
  revalidatePath('/contacts')
  revalidatePath('/categories')
}
