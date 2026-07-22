'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function handleSignIn(email: string) {
  const supabase = await createClient()
  
  // Use a unified demo password behind the scenes to preserve the input-free UX
  const DEMO_PASSWORD = 'Harborview2026!'

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: DEMO_PASSWORD,
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