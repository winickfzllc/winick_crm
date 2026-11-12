'use server'

import { createServerClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = createServerClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return { error: error?.message ?? 'Login failed' }
  }

  const session = await getSession()
  session.userId = data.user.id
  session.email = data.user.email!
  await session.save()

  redirect('/')
}

export async function logoutAction() {
  const session = await getSession()
  await session.destroy()
  redirect('/login')
}
