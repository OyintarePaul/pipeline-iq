'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Users } from 'lucide-react';
import { AddCandidateModal } from './AddCandidateModal';

interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  resumeNotes: string;
}

interface Recruiter {
  id: string;
  fullName: string;
  role: string;
}

interface PipelineEntry {
  id: string;
  candidateId: string;
  stage: string;
  jobOrderId?: string;
  jobTitle?: string;
  recruiterId?: string;
}

interface CandidatesViewClientProps {
  initialCandidates: Candidate[];
  recruiters: Recruiter[];
  pipelineEntries: PipelineEntry[];
  isRecruiter: boolean;
}

export const CandidatesViewClient: React.FC<CandidatesViewClientProps> = ({
  initialCandidates,
  recruiters,
  pipelineEntries,
  isRecruiter,
}) => {
  const [candidateSearch, setCandidateSearch] = useState('');
  const [candidateStageFilter, setCandidateStageFilter] = useState('all');
  const [candidateRecruiterFilter, setCandidateRecruiterFilter] = useState('all');
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);

  // Client-Side Search & Filter Logic
  const filteredCandidates = initialCandidates.filter((cand) => {
    // 1. Text Search
    const matchesSearch =
      cand.fullName.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      cand.email.toLowerCase().includes(candidateSearch.toLowerCase());

    const candPipelines = pipelineEntries.filter((e) => e.candidateId === cand.id);

    // 2. Stage Filter
    const matchesStage =
      candidateStageFilter === 'all' ||
      candPipelines.some((p) => p.stage === candidateStageFilter);

    // 3. Recruiter Filter (Owner view)
    const matchesRecruiter =
      candidateRecruiterFilter === 'all' ||
      candPipelines.some((p) => p.recruiterId === candidateRecruiterFilter);

    return matchesSearch && matchesStage && matchesRecruiter;
  });

  return (
    <div className="space-y-6" id="candidates-pool-view">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="candidates-header">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">
            Global Candidates Pool
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">
            {isRecruiter
              ? 'Candidates currently engaged inside your staffing pipeline.'
              : 'Search, profile, and drill-down into every recruiter candidate engaged in active job tracks.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddCandidateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-widest py-3 px-4 rounded-sm shadow-sm transition-all flex items-center gap-2 self-start sm:self-center cursor-pointer"
          id="register-candidate-btn"
        >
          <Plus className="w-4.5 h-4.5" /> Register Candidate
        </button>
      </div>

      {/* Search & Filtering Row */}
      <div className="bg-white p-4 rounded border border-slate-200 flex flex-col md:flex-row items-center gap-3 shadow-sm" id="candidates-filters-bar">
        <div className="relative w-full md:flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={candidateSearch}
            onChange={(e) => setCandidateSearch(e.target.value)}
            placeholder="Search candidates by name or email..."
            className="w-full text-xs border border-slate-200 rounded pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto border-t md:border-t-0 pt-2.5 md:pt-0">
          {/* Stage Filter */}
          <select
            value={candidateStageFilter}
            onChange={(e) => setCandidateStageFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded py-2 px-3 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider cursor-pointer"
          >
            <option value="all">All Stages</option>
            <option value="Sourced">Sourced</option>
            <option value="Contacted">Contacted</option>
            <option value="Submitted">Submitted</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offer">Offer</option>
            <option value="Placed">Placed</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Recruiter Filter (Owner only) */}
          {!isRecruiter && (
            <select
              value={candidateRecruiterFilter}
              onChange={(e) => setCandidateRecruiterFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded py-2 px-3 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider cursor-pointer"
            >
              <option value="all">All Recruiters</option>
              {recruiters.map((rec) => (
                <option key={rec.id} value={rec.id}>
                  {rec.fullName}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Candidates Table */}
      {filteredCandidates.length === 0 ? (
        <div className="p-10 text-center text-slate-400 bg-white border border-slate-200 rounded shadow-sm">
          <Users className="w-10 h-10 stroke-[1.2] text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold uppercase tracking-wider">No candidates found.</p>
          <p className="text-xs mt-1">Adjust filters or register a candidate into the portal.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden" id="candidates-table-container">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[10px] tracking-wider font-mono">
                <th className="p-4 pl-6">Candidate Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Active Positions</th>
                <th className="p-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCandidates.map((cand) => {
                const candPipelines = pipelineEntries.filter((e) => e.candidateId === cand.id);

                return (
                  <tr key={cand.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-800 text-sm">{cand.fullName}</td>
                    <td className="p-4 text-slate-500 font-mono text-[11px]">{cand.email}</td>
                    <td className="p-4 text-slate-500 font-semibold">{cand.phone || 'N/A'}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                        {candPipelines.length === 0 ? (
                          <span className="text-slate-400 italic text-[11px] font-bold uppercase tracking-wider">
                            Unassigned
                          </span>
                        ) : (
                          candPipelines.map((p) => (
                            <span
                              key={p.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-slate-100 border border-slate-200 text-[9px] text-slate-700 font-bold uppercase tracking-wider"
                            >
                              {p.jobTitle || 'Position'} ({p.stage})
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right pr-6">
                      {/* URL Navigation replaces setSelectedCandidateId */}
                      <Link
                        href={`?candidateId=${cand.id}`}
                        className="inline-block text-[10px] uppercase tracking-widest bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 py-2 px-3.5 rounded-sm border border-slate-200 hover:border-blue-600 transition-all font-bold cursor-pointer"
                      >
                        Manage Details &rarr;
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Register Candidate Modal */}
      {showAddCandidateModal && (
        <AddCandidateModal onClose={() => setShowAddCandidateModal(false)} />
      )}
    </div>
  );
};