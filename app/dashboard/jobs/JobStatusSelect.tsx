'use client';

import React, { useTransition } from 'react';
import { updateJobStatusAction } from '@/actions';

export const JobStatusSelect = ({ jobId, currentStatus }: { jobId: string; currentStatus: string }) => {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    startTransition(async () => {
      await updateJobStatusAction(jobId, newStatus);
    });
  };

  return (
    <select
      value={currentStatus}
      disabled={isPending}
      onChange={handleChange}
      className={`text-[10px] font-bold border rounded-sm py-1 px-2 cursor-pointer font-sans uppercase tracking-wider disabled:opacity-50 ${
        currentStatus === 'open'
          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
          : currentStatus === 'filled'
          ? 'bg-blue-50 text-blue-700 border-blue-100'
          : 'bg-slate-100 text-slate-700 border-slate-200'
      }`}
    >
      <option value="open">OPEN</option>
      <option value="filled">FILLED</option>
      <option value="closed">CLOSED</option>
    </select>
  );
};