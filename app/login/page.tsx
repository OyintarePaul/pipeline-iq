'use client'

import React, { useState, useTransition } from 'react'
import { AlertTriangle, Lock, ChevronRight, Loader2 } from 'lucide-react'
import { handleSignIn } from './actions'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Centralized authentication executor
  const executeLogin = (targetEmail: string) => {
    setLoginError(null)
    startTransition(async () => {
      const result = await handleSignIn(targetEmail)
      if (result?.error) {
        setLoginError(result.error)
      }
    })
  }

  const handleLoginSubmit = (e: React.SubmitEvent) => {
    e.preventDefault()
    if (!email) return
    executeLogin(email)
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4 relative" id="login-layout">
      <div className="w-full max-w-md bg-[#0F172A] border border-slate-800 p-8 shadow-2xl relative z-10 rounded-sm" id="login-card">
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

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Demo Account Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. owner@harborview.com"
              className="w-full bg-[#0b0f19] border border-slate-800 px-4 py-3 text-xs focus:outline-none focus:border-blue-500 text-slate-200 rounded-sm"
              disabled={isPending}
              required
            />
          </div>

          {loginError && (
            <p className="text-[10px] uppercase tracking-wider font-bold text-red-400 flex items-center gap-2 bg-red-950/40 p-3 border border-red-900/50 rounded-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              {loginError}
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

        {/* Quick Demo Logins */}
        <div className="mt-8 pt-6 border-t border-slate-800 space-y-3" id="quick-logins">
          <p className="text-[9px] font-black text-slate-500 text-center uppercase tracking-widest">Demo Quick Access Click-Through</p>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => executeLogin('owner@harborview.com')}
              disabled={isPending}
              className="bg-slate-900 hover:bg-slate-800/80 disabled:opacity-50 text-slate-100 text-[11px] py-3 px-4 border border-slate-800 hover:border-slate-700 transition-all text-left flex items-center justify-between cursor-pointer rounded-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-none bg-amber-500 shrink-0" />
                <div>
                  <p className="font-bold text-white uppercase text-[10px] tracking-wider leading-none">Elena Rostova</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide mt-1">Agency Owner / Manager</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => executeLogin('david@harborview.com')}
              disabled={isPending}
              className="bg-slate-900 hover:bg-slate-800/80 disabled:opacity-50 text-slate-100 text-[11px] py-3 px-4 border border-slate-800 hover:border-slate-700 transition-all text-left flex items-center justify-between cursor-pointer rounded-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-none bg-blue-500 shrink-0" />
                <div>
                  <p className="font-bold text-white uppercase text-[10px] tracking-wider leading-none">David Miller</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide mt-1">Senior Staffing Recruiter</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => executeLogin('sarah@harborview.com')}
              disabled={isPending}
              className="bg-slate-900 hover:bg-slate-800/80 disabled:opacity-50 text-slate-100 text-[11px] py-3 px-4 border border-slate-800 hover:border-slate-700 transition-all text-left flex items-center justify-between cursor-pointer rounded-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-none bg-emerald-500 shrink-0" />
                <div>
                  <p className="font-bold text-white uppercase text-[10px] tracking-wider leading-none">Sarah Jenkins</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide mt-1">Logistics & Supply Specialist</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}