'use client';

import React, { useState, useTransition, useOptimistic } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Clock, UserPlus, ArrowLeft, Briefcase, Building, User } from 'lucide-react';
import { updatePipelineStageAction, addCandidateToPipelineAction } from '@/actions';

export type PipelineStage = 'Sourced' | 'Contacted' | 'Submitted' | 'Interviewing' | 'Offer' | 'Placed' | 'Rejected';

interface PipelineEntry {
  id: string;
  candidateId: string;
  stage: PipelineStage;
  stageUpdatedAt: string;
  candidate: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface KanbanClientProps {
  job: {
    id: string;
    title: string;
    clientName: string;
    status: string;
  };
  initialEntries: PipelineEntry[];
  availableCandidates: Array<{ id: string; fullName: string }>;
  selectedCandidateId?: string;
}

const STAGES: PipelineStage[] = [
  'Sourced',
  'Contacted',
  'Submitted',
  'Interviewing',
  'Offer',
  'Placed',
  'Rejected'
];

const STAGE_DOT_COLORS: Record<PipelineStage, string> = {
  Sourced: 'bg-slate-400',
  Contacted: 'bg-indigo-500',
  Submitted: 'bg-blue-500',
  Interviewing: 'bg-amber-500',
  Offer: 'bg-purple-500',
  Placed: 'bg-emerald-500',
  Rejected: 'bg-rose-500'
};

export function KanbanClient({
  job,
  initialEntries,
  availableCandidates,
  selectedCandidateId
}: KanbanClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [draggedEntryId, setDraggedEntryId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [showAddCandidateInput, setShowAddCandidateInput] = useState(false);
  const [candidateToAdd, setCandidateToAdd] = useState('');

  // 🚀 React 19 Optimistic State for Instant Drag-and-Drop Updates
  const [optimisticEntries, setOptimisticEntries] = useOptimistic(
    initialEntries,
    (currentEntries, update: { entryId: string; newStage: PipelineStage }) => {
      return currentEntries.map(entry => {
        if (entry.id === update.entryId) {
          return {
            ...entry,
            stage: update.newStage,
            stageUpdatedAt: new Date().toISOString() // Reset timer optimistically
          };
        }
        return entry;
      });
    }
  );

  // Group optimistic entries by stage
  const entriesByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = optimisticEntries.filter(entry => entry.stage === stage);
    return acc;
  }, {} as Record<PipelineStage, PipelineEntry[]>);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, entryId: string) => {
    setDraggedEntryId(entryId);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      const element = document.getElementById(`card-${entryId}`);
      if (element) element.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = (entryId: string) => {
    setDraggedEntryId(null);
    setDragOverStage(null);
    const element = document.getElementById(`card-${entryId}`);
    if (element) element.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStage: PipelineStage) => {
    e.preventDefault();

    if (draggedEntryId) {
      const entryId = draggedEntryId;
      const currentEntry = optimisticEntries.find(e => e.id === entryId);

      // Only dispatch if actually changing stages
      if (currentEntry && currentEntry.stage !== targetStage) {
        startTransition(async () => {
          // 1. Immediately update local UI optimistically
          setOptimisticEntries({ entryId, newStage: targetStage });

          // 2. Persist change on the server in background
          const result = await updatePipelineStageAction(entryId, targetStage);

          if (!result?.success) {
            console.error('Failed to update stage:', result?.error);
            // If the server action fails, React automatically rolls back optimisticEntries
            // when the transition resolves.
          }
        });
      }
    }

    setDraggedEntryId(null);
    setDragOverStage(null);
  };

  const handleAddCandidate = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!candidateToAdd) return;

    startTransition(async () => {
      await addCandidateToPipelineAction(candidateToAdd, job.id);
      setCandidateToAdd('');
      setShowAddCandidateInput(false);
    });
  };

  const getStalledDays = (updatedAtStr: string, stage: PipelineStage) => {
    if (stage === 'Placed' || stage === 'Rejected') return 0;
    const lastUpdate = new Date(updatedAtStr).getTime();
    const today = new Date().getTime();
    const diffTime = Math.abs(today - lastUpdate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStageBorderColor = (s: PipelineStage, stalled: boolean) => {
    if (stalled) return 'border-l-4 border-l-rose-500';
    switch (s) {
      case 'Sourced':
      case 'Contacted':
        return 'border-l-4 border-l-slate-400';
      case 'Submitted':
        return 'border-l-4 border-l-blue-500';
      case 'Interviewing':
        return 'border-l-4 border-l-amber-500 ring-2 ring-amber-100';
      case 'Offer':
        return 'border-l-4 border-l-purple-500';
      case 'Placed':
        return 'border-l-4 border-l-emerald-500';
      case 'Rejected':
        return 'border-l-4 border-l-rose-500';
      default:
        return 'border-l-4 border-l-slate-300';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]" id="kanban-container">
      {/* Kanban Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100" id="kanban-header">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/jobs"
            className="p-2 hover:bg-white rounded-lg border border-slate-200 shadow-sm text-slate-600 transition-all flex items-center justify-center cursor-pointer"
            title="Back to Jobs"
            id="kanban-back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${job.status === 'open' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                job.status === 'filled' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                  'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                {job.status.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {job.id}</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-indigo-500" />
              {job.title}
            </h1>
            <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
              <Building className="w-4 h-4 text-slate-400" />
              {job.clientName}
            </p>
          </div>
        </div>

        {/* Quick Add Candidate */}
        <div className="flex items-center gap-2 self-start md:self-center">
          {!showAddCandidateInput ? (
            <button
              onClick={() => setShowAddCandidateInput(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2 px-4 rounded-lg flex items-center gap-2 shadow-sm shadow-indigo-100 transition-all cursor-pointer"
              id="kanban-quick-add-btn"
            >
              <UserPlus className="w-4 h-4" />
              Add Candidate
            </button>
          ) : (
            <form onSubmit={handleAddCandidate} className="flex items-center gap-2 bg-white p-1.5 border border-slate-200 rounded-lg shadow-sm" id="kanban-quick-add-form">
              <select
                value={candidateToAdd}
                onChange={(e) => setCandidateToAdd(e.target.value)}
                className="text-sm border-0 focus:ring-0 bg-transparent text-slate-700 max-w-[200px] outline-none"
                required
                id="kanban-candidate-select"
              >
                <option value="">Select Candidate...</option>
                {availableCandidates.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!candidateToAdd || isPending}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium text-xs px-3 py-1.5 rounded-md transition-all cursor-pointer"
                id="kanban-submit-candidate-btn"
              >
                {isPending ? 'Adding...' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddCandidateInput(false);
                  setCandidateToAdd('');
                }}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
                id="kanban-cancel-add-btn"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Horizontal Scrolling Kanban Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden py-6 -mx-6 px-6 flex gap-4 items-start" id="kanban-board-grid">
        {STAGES.map(stage => {
          const stageEntries = entriesByStage[stage] || [];
          const isOver = dragOverStage === stage;

          return (
            <div
              key={stage}
              onDragOver={(e) => handleDragOver(e, stage)}
              onDrop={(e) => handleDrop(e, stage)}
              className={`w-80 shrink-0 bg-slate-200/50 rounded-lg p-2 border flex flex-col max-h-full transition-all ${isOver ? 'border-blue-500 bg-blue-500/5' : 'border-slate-200'
                }`}
              id={`column-${stage.toLowerCase()}`}
            >
              {/* Column Header */}
              <div className="flex justify-between items-center px-2 py-3 mb-2" id={`column-header-${stage.toLowerCase()}`}>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${STAGE_DOT_COLORS[stage]}`} />
                  {stage}
                </h3>
                <span className="px-2 py-0.5 bg-slate-300 rounded text-[10px] font-bold text-slate-700">
                  {stageEntries.length}
                </span>
              </div>

              {/* Column Cards */}
              <div
                className="flex-1 overflow-y-auto p-1 flex flex-col gap-3 min-h-[250px]"
                id={`column-cards-${stage.toLowerCase()}`}
              >
                {stageEntries.length === 0 ? (
                  <div className="flex-1 border-2 border-dashed border-slate-300 rounded flex flex-col items-center justify-center py-12 text-slate-400 select-none bg-white/40">
                    <User className="w-8 h-8 stroke-[1.2] mb-1.5 text-slate-300" />
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Empty Stage</p>
                  </div>
                ) : (
                  stageEntries.map(entry => {
                    const stalledDays = getStalledDays(entry.stageUpdatedAt, entry.stage);
                    const isStalled = stalledDays >= 5;

                    return (
                      <div
                        key={entry.id}
                        id={`card-${entry.id}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, entry.id)}
                        onDragEnd={() => handleDragEnd(entry.id)}
                        onClick={() => router.push(`/dashboard/pipeline?jobId=${job.id}&candidateId=${entry.candidateId}`)}
                        className={`bg-white p-4 rounded shadow-sm hover:shadow active:cursor-grabbing transition-all cursor-pointer group relative ${getStageBorderColor(stage, isStalled)}`}
                      >
                        {/* Stalled Badge */}
                        {isStalled && (
                          <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-semibold px-2 py-0.5 rounded-sm mb-2 w-max">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            Stalled for {stalledDays} days
                          </div>
                        )}

                        <h4 className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors">
                          {entry.candidate.fullName}
                        </h4>

                        <p className="text-[10px] text-slate-500 uppercase tracking-tight mt-1 truncate">
                          {entry.candidate.email}
                        </p>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(entry.stageUpdatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity font-sans font-bold uppercase tracking-wider">
                            View &rarr;
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}