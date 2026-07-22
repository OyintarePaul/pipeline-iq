import { createClient } from '@/lib/supabase/server';
import { DrawerShell } from './DrawerShell';
import { StageSelect, AddNoteForm, AddFollowUpForm, FollowUpToggle } from './DrawerInteractiveForms';
import { Mail, Phone, Briefcase, Clock } from 'lucide-react';

interface CandidateDetailDrawerProps {
  candidateId?: string;
}

export async function CandidateDetailDrawer({ candidateId }: CandidateDetailDrawerProps) {
  if (!candidateId) return null;

  const supabase = await createClient();

  const { data: candidate } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', candidateId)
    .single();

  if (!candidate) return null;

  const { data: pipelineEntriesRes } = await supabase
    .from('pipeline_entries')
    .select(`
      *,
      job_order:job_orders(*)
    `)
    .eq('candidate_id', candidateId);

  const candidateEntries = pipelineEntriesRes || [];
  const entryIds = candidateEntries.map(e => e.id);

  let candidateNotes: any[] = [];
  let candidateFollowups: any[] = [];

  if (entryIds.length > 0) {
    const [notesRes, followUpsRes] = await Promise.all([
      supabase.from('notes').select('*').in('pipeline_entry_id', entryIds).order('created_at', { ascending: false }),
      supabase.from('follow_ups').select('*').in('pipeline_entry_id', entryIds).order('due_date', { ascending: true }),
    ]);
    candidateNotes = notesRes.data || [];
    candidateFollowups = followUpsRes.data || [];
  }

  const activePipelines = candidateEntries.map(entry => ({
    entry,
    job: entry.job_order
  })).filter(item => item.job !== null && item.job !== undefined);

  return (
    <DrawerShell candidateName={candidate.full_name} candidateId={candidate.id}>
      {/* Contact Details */}
      <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100" id="drawer-contact-section">
        <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Contact Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <a href={`mailto:${candidate.email}`} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors">
            <Mail className="w-4 h-4 text-slate-400" />
            <span className="truncate">{candidate.email}</span>
          </a>
          <a href={`tel:${candidate.phone}`} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors">
            <Phone className="w-4 h-4 text-slate-400" />
            <span>{candidate.phone}</span>
          </a>
        </div>
      </div>

      {/* Resume Notes */}
      <div className="space-y-2" id="drawer-resume-section">
        <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Candidate & Resume Notes</h3>
        <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 border border-slate-100 p-4 rounded-xl">
          {candidate.resume_notes || "No notes captured on addition."}
        </p>
      </div>

      {/* Active Job Pipelines */}
      <div className="space-y-4" id="drawer-pipelines-section">
        <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Job Pipelinings</h3>
        {activePipelines.length === 0 ? (
          <p className="text-sm text-slate-400 italic">This candidate is not yet attached to any active job orders.</p>
        ) : (
          activePipelines.map(({ entry, job }) => {
            if (!job) return null;
            return (
              <div key={entry.id} className="border border-slate-100 p-4 rounded-xl bg-white space-y-4" id={`pipeline-item-${entry.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-indigo-500" />
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{job.title}</h4>
                      <p className="text-xs text-slate-400">{job.client_name}</p>
                    </div>
                  </div>

                  {/* Stage Selector */}
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Pipeline Stage</span>
                    <StageSelect entryId={entry.id} currentStage={entry.stage} />
                  </div>
                </div>

                {/* Stage Status */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono bg-slate-50/50 p-2 rounded-lg">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Last Stage Change: {new Date(entry.stage_updated_at || entry.stageUpdatedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-50">
                  <AddNoteForm entryId={entry.id} />
                  <AddFollowUpForm entryId={entry.id} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Activity / Notes History */}
      <div className="space-y-3" id="drawer-notes-history-section">
        <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Activity & Communication Logs</h3>
        {candidateNotes.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No activity logs recorded yet.</p>
        ) : (
          <div className="relative border-l border-slate-100 pl-4 space-y-4 ml-2">
            {candidateNotes.map(note => (
              <div key={note.id} className="relative text-xs space-y-1" id={`note-item-${note.id}`}>
                <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-200 border-2 border-white" />

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{note.author_name || note.authorName}</span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {new Date(note.created_at || note.createdAt).toLocaleDateString()} @ {new Date(note.created_at || note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-50">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Follow-up Reminders List */}
      <div className="space-y-3" id="drawer-followups-list-section">
        <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Actionable Reminders</h3>
        {candidateFollowups.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No follow-ups scheduled for this candidate.</p>
        ) : (
          <div className="space-y-2">
            {candidateFollowups.map(followup => {
              const jobLink = activePipelines.find(p => p.entry.id === (followup.pipeline_entry_id || followup.pipelineEntryId));
              const dueDate = new Date(followup.due_date || followup.dueDate);
              const isDone = followup.is_done ?? followup.isDone;
              const isOverdue = dueDate < new Date() && !isDone;

              return (
                <div
                  key={followup.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all text-xs bg-white ${isDone ? 'border-slate-100 bg-slate-50/50' :
                      isOverdue ? 'border-rose-100 bg-rose-50/20' : 'border-slate-100'
                    }`}
                  id={`followup-item-${followup.id}`}
                >
                  <FollowUpToggle followupId={followup.id} isDone={isDone} />

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-semibold font-mono ${isDone ? 'text-slate-400 line-through' :
                          isOverdue ? 'text-rose-700' : 'text-slate-700'
                        }`}>
                        Due: {dueDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {isOverdue && (
                        <span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          OVERDUE
                        </span>
                      )}
                    </div>
                    {jobLink && (
                      <p className="text-slate-500 text-xs">
                        Follow-up on <span className="font-semibold text-slate-700">{jobLink.job?.title}</span> pipeline
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DrawerShell>
  );
}