'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// const DEMO_PASSWORD = 'Harborview2026!'

export async function handleSignIn(_prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (authError) {
    return { error: 'Invalid demo email or account not initialized.' }
  }

  // Fetch user role from public.profiles to route them correctly
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  if (profileError || !profile) {
    return { error: 'Failed to synchronize user configuration profile.' }
  }

  // Smart routing based on role rules defined in your blueprint
  if (profile.role === 'owner') {
    redirect('/dashboard/owner')
  } else {
    redirect('/dashboard')
  }
}