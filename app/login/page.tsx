'use client'

import React, { useActionState } from 'react'
import { AlertTriangle, Lock, Loader2 } from 'lucide-react'
import { handleSignIn } from './actions'

export default function LoginPage() {
  // React 19's useActionState natively handles state updates, transitions, and loading
  const [state, formAction, isPending] = useActionState(handleSignIn, null)

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4 relative" id="login-layout">
      <div className="w-full max-w-md bg-[#0F172A] border border-slate-800 p-8 shadow-2xl relative z-10 rounded-sm" id="login-card">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex gap-2 items-center justify-center mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-sm flex items-center justify-center font-bold text-white font-mono text-sm shadow-sm">
              PIQ
            </div>
            <span className="text-xs text-white font-black uppercase tracking-widest font-mono">
              PipelineIQ
            </span>
          </div>
          <h1 className="text-lg font-bold tracking-widest text-white uppercase">Harborview Staffing</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1.5 font-bold">Recruitment Pipeline Management Suite</p>
        </div>

        {/* Login Form */}
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="e.g. user@harborview.com"
              className="w-full bg-[#0b0f19] border border-slate-800 px-4 py-3 text-xs focus:outline-none focus:border-blue-500 text-slate-200 rounded-sm"
              disabled={isPending}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="w-full bg-[#0b0f19] border border-slate-800 px-4 py-3 text-xs focus:outline-none focus:border-blue-500 text-slate-200 rounded-sm"
              disabled={isPending}
              required
            />
          </div>

          {state?.error && (
            <p className="text-[10px] uppercase tracking-wider font-bold text-red-400 flex items-center gap-2 bg-red-950/40 p-3 border border-red-900/50 rounded-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold uppercase tracking-widest text-[11px] py-3.5 rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying Credentials...
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" /> Sign In Securely
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}