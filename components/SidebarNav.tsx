'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Award, TrendingUp, Briefcase, Users, LogOut } from 'lucide-react'
import { handleSignOut } from '@/app/dashboard/auth-actions'

interface SidebarNavProps {
  profile: {
    full_name: string
    role: 'owner' | 'recruiter'
  }
}

export default function SidebarNav({ profile }: SidebarNavProps) {
  const pathname = usePathname()
  const isRecruiter = profile.role === 'recruiter'

  // Compute initials for the avatar badge dynamically
  const initials = profile.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('')
    : '??'

  // Helper to apply your exact active link styling state rules
  const getLinkClass = (paths: string[]) => {
    const isActive = paths.some(p => pathname === p)
    return `w-full text-left font-bold text-[10px] uppercase tracking-widest py-3 px-4 transition-all flex items-center gap-3 cursor-pointer ${
      isActive
        ? 'bg-blue-500/10 text-blue-400 border-l-2 border-blue-500'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-l-2 border-transparent'
    }`
  }

  return (
    <aside className="w-full md:w-64 bg-[#0F172A] text-slate-300 border-r border-slate-800 flex flex-col justify-between shrink-0" id="app-sidebar">
      <div>
        {/* Sidebar Brand Logo */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-sm flex items-center justify-center font-bold text-white font-mono text-sm shadow-sm shrink-0">
            PIQ
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white leading-none">PipelineIQ</h2>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-1">Harborview Staffing</span>
          </div>
        </div>

        {/* Nav Links mapping directly to App Router directories */}
        <nav className="py-6 space-y-1" id="sidebar-nav">
          {/* Owner Dashboard Home */}
          {!isRecruiter && (
            <Link href="/dashboard/owner" className={getLinkClass(['/dashboard/owner'])}>
              <Award className="w-4 h-4 text-blue-400" /> Owner Dashboard
            </Link>
          )}

          {/* Recruiter Dashboard */}
          <Link href="/dashboard" className={getLinkClass(['/dashboard'])}>
            <TrendingUp className="w-4 h-4 text-blue-400" />
            {isRecruiter ? 'My Dashboard' : 'Recruiter Workspace'}
          </Link>

          {/* Job Orders List */}
          <Link href="/dashboard/jobs" className={getLinkClass(['/dashboard/jobs', '/dashboard/pipeline'])}>
            <Briefcase className="w-4 h-4 text-blue-400" />
            {isRecruiter ? 'My Job Orders' : 'All Job Orders'}
          </Link>

          {/* Candidates List */}
          <Link href="/dashboard/candidates" className={getLinkClass(['/dashboard/candidates'])}>
            <Users className="w-4 h-4 text-blue-400" /> Candidates Pool
          </Link>
        </nav>
      </div>

      {/* User Info footer and switch user badge */}
      <div className="p-4 border-t border-slate-800 space-y-4" id="sidebar-footer">
        <div className="bg-[#0b0f19] p-3.5 rounded border border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-xs shrink-0 uppercase border border-slate-700 italic">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{profile.full_name}</p>
            <span className={`inline-flex px-1.5 py-0.5 rounded-sm text-[8px] font-bold tracking-widest uppercase mt-0.5 ${
              profile.role === 'owner' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-400'
            }`}>
              {profile.role === 'owner' ? 'Agency Owner' : 'Recruiter'}
            </span>
          </div>
        </div>

        {/* Safe Logout Button executing our Server Action */}
        <button
          onClick={() => handleSignOut()}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] uppercase tracking-widest py-2.5 px-3 rounded-sm flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700/50"
          id="logout-btn"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  )
}