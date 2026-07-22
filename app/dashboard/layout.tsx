import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarNav from '@/components/SidebarNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  // Verify the user has a valid active auth cookie session
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // Extract the true profile payload containing role and fullName data fields
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  // Fallback to guard against missing synchronized account profile maps
  if (profileError || !profile) {
    redirect('/login?error=profile_not_found')
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F1F5F9] text-slate-900 font-sans" id="app-layout">
      {/* Hydrate navigation framework sidebar securely with server data */}
      <SidebarNav profile={profile} />

      {/* Primary Dynamic Content Frame */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F1F5F9]" id="app-main-panel">
        {children}
      </main>
    </div>
  )
}