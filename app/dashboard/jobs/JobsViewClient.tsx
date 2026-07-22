'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Briefcase, Building } from 'lucide-react';
import { JobStatusSelect } from './JobStatusSelect';
import { AddJobModal } from './AddJobModal';

interface Job {
  id: string;
  title: string;
  clientName: string;
  status: string;
  recruiterId: string;
}

interface Recruiter {
  id: string;
  fullName: string;
  role: string;
}

interface JobsViewClientProps {
  initialJobs: Job[];
  recruiters: Recruiter[];
  pipelineCounts: Record<string, number>;
  currentUser: { id: string; role: string };
  isRecruiter: boolean;
}

export const JobsViewClient: React.FC<JobsViewClientProps> = ({
  initialJobs,
  recruiters,
  pipelineCounts,
  currentUser,
  isRecruiter,
}) => {
  const [jobSearch, setJobSearch] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState<string>('all');
  const [showAddJobModal, setShowAddJobModal] = useState(false);

  // Pure Client-Side Filtering
  const filteredJobOrders = initialJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
      job.clientName.toLowerCase().includes(jobSearch.toLowerCase());

    const matchesStatus =
      jobStatusFilter === 'all' || job.status === jobStatusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6" id="job-orders-view">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="jobs-header">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">
            {isRecruiter ? 'My Assigned Job Orders' : 'Staffing Job Orders'}
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">
            {isRecruiter
              ? 'Manage your assigned recruitment positions and pipeline placements.'
              : 'Complete list of open, closed, and filled job requests across recruiters.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddJobModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-widest py-3 px-4 rounded-sm shadow-sm transition-all flex items-center gap-2 self-start sm:self-center cursor-pointer"
          id="create-job-btn"
        >
          <Plus className="w-4.5 h-4.5" /> New Job Order
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded border border-slate-200 flex flex-col md:flex-row items-center gap-3 shadow-sm" id="jobs-filters-bar">
        <div className="relative w-full md:flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={jobSearch}
            onChange={(e) => setJobSearch(e.target.value)}
            placeholder="Search by job title or client company..."
            className="w-full text-xs border border-slate-200 rounded pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto border-t md:border-t-0 pt-2.5 md:pt-0">
          {['all', 'open', 'filled', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setJobStatusFilter(status)}
              className={`text-[10px] uppercase tracking-widest px-3 py-2 rounded-sm font-bold transition-all cursor-pointer shrink-0 ${
                jobStatusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filteredJobOrders.length === 0 ? (
        <div className="p-10 text-center text-slate-400 bg-white border border-slate-200 rounded shadow-sm">
          <Briefcase className="w-10 h-10 stroke-[1.2] text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold uppercase tracking-wider">No Job Orders found.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden" id="jobs-table-container">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[10px] tracking-wider font-mono">
                <th className="p-4 pl-6">Job Title</th>
                <th className="p-4">Client Company</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">In Pipeline</th>
                {!isRecruiter && <th className="p-4">Assigned Recruiter</th>}
                <th className="p-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJobOrders.map((job) => {
                const count = pipelineCounts[job.id] || 0;
                const recruiter = recruiters.find((r) => r.id === job.recruiterId);

                return (
                  <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-800 text-sm">{job.title}</td>
                    <td className="p-4 text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {job.clientName}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <JobStatusSelect jobId={job.id} currentStatus={job.status} />
                    </td>
                    <td className="p-4 text-center font-bold font-mono text-slate-700 text-sm">{count}</td>
                    {!isRecruiter && (
                      <td className="p-4 text-slate-500 font-bold uppercase text-[10px] tracking-tight">
                        {recruiter?.fullName || 'Unassigned'}
                      </td>
                    )}
                    <td className="p-4 text-right pr-6">
                      {/* Next.js URL navigation replacing setCurrentView */}
                      <Link
                        href={`/pipeline?jobId=${job.id}`}
                        className="inline-block text-[10px] uppercase tracking-widest bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3.5 rounded-sm border border-blue-100 font-bold transition-all cursor-pointer"
                      >
                        View Board &rarr;
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Job Modal */}
      {showAddJobModal && (
        <AddJobModal
          recruiters={recruiters}
          currentUser={currentUser}
          onClose={() => setShowAddJobModal(false)}
        />
      )}
    </div>
  );
};