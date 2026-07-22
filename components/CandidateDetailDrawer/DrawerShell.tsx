'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';

interface DrawerShellProps {
  candidateName: string;
  candidateId: string;
  children: React.ReactNode;
}

export const DrawerShell: React.FC<DrawerShellProps> = ({ candidateName, candidateId, children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('candidateId');
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl, { scroll: false });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" id="drawer-wrapper">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={handleClose}
        id="drawer-backdrop"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl bg-white shadow-2xl h-full flex flex-col z-10" id="drawer-panel">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50" id="drawer-header">
          <div>
            <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono uppercase px-2 py-0.5 rounded-full font-semibold">
              Candidate Profile
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1" id="drawer-candidate-name">{candidateName}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {candidateId}</p>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
            id="drawer-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8" id="drawer-body">
          {children}
        </div>
      </div>
    </div>
  );
};