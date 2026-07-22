import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AlertTriangle, Briefcase, CheckCircle2, Users } from 'lucide-react';
import { CandidateDetailDrawer } from '@/components/CandidateDetailDrawer/CandidateDetailDrawer';
import { FollowUpToggle } from '@/components/CandidateDetailDrawer/DrawerInteractiveForms';

export default async function RecruiterDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ candidateId?: string }>;
}) {
  const { candidateId } = await searchParams;
  const supabase = await createClient();

  // Verify active user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    redirect('/login?error=profile_not_found');
  }

  const isRecruiter = profile.role === 'recruiter';

  // Fetch dashboard data in parallel
  const [jobOrdersRes, pipelineRes, candidatesRes, followUpsRes] = await Promise.all([
    supabase.from('job_orders').select('*'),
    supabase.from('pipeline_entries').select(`
      *,
      candidate:candidates(*),
      job_order:job_orders(
        *,
        recruiter:profiles(*)
      )
    `),
    supabase.from('candidates').select('*'),
    supabase.from('follow_ups').select('*'),
  ]);

  const jobOrders = jobOrdersRes.data || [];
  const pipelineEntries = pipelineRes.data || [];
  const candidates = candidatesRes.data || [];
  const followUps = followUpsRes.data || [];

  // Metrics Calculations
  const totalActivePipeline = pipelineEntries.filter(e => e.stage !== 'Placed' && e.stage !== 'Rejected').length;

  const stalledCandidatesList = pipelineEntries
    .filter(entry => entry.stage !== 'Placed' && entry.stage !== 'Rejected')
    .map(entry => {
      const lastUpdate = new Date(entry.stage_updated_at || entry.stageUpdatedAt).getTime();
      const today = new Date().getTime();
      const daysStalled = Math.floor(Math.abs(today - lastUpdate) / (1000 * 60 * 60 * 24));

      return {
        id: entry.id,
        stage: entry.stage,
        candidateName: entry.candidate?.full_name || entry.candidate?.fullName || 'Unknown Candidate',
        jobTitle: entry.job_order?.title || 'Unknown Position',
        clientName: entry.job_order?.client_name || entry.job_order?.clientName || 'Unknown Client',
        recruiterName: entry.job_order?.recruiter?.full_name || 'Unassigned',
        daysStalled,
      };
    })
    .filter(item => item.daysStalled >= 5)
    .sort((a, b) => b.daysStalled - a.daysStalled);

  const stalledCount = stalledCandidatesList.length;
  const pipelineHealth = totalActivePipeline > 0
    ? Math.round(((totalActivePipeline - stalledCount) / totalActivePipeline) * 100)
    : 100;

  // Filter follow-ups requiring attention
  const myFollowups = followUps.filter(f => {
    const isDone = f.is_done ?? f.isDone;
    const dueDate = new Date(f.due_date || f.dueDate);
    return !isDone && dueDate <= new Date();
  });

  const visibleCandidates = candidates;
  const visibleJobOrders = jobOrders;

  return (
    <div className="space-y-8" id="recruiter-dashboard-view">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="recruiter-dashboard-header">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">
            Welcome back, {profile.full_name.split(' ')[0]}
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">
            {isRecruiter
              ? "Your active client staffing accounts, pipeline metrics, and follow-ups."
              : "Drill-down view of recruiters' workspace tasks, pipelines, and follow-ups."}
          </p>
        </div>

        {/* Header metrics */}
        <div className="flex gap-6 shrink-0">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Stalled Profiles</p>
            <p className="text-lg font-mono font-bold text-red-500 underline decoration-2 underline-offset-4">
              {String(stalledCount).padStart(2, '0')}
            </p>
          </div>
          <div className="text-right border-l border-slate-200 pl-6">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Pipeline Health</p>
            <p className="text-lg font-mono font-bold text-emerald-500 italic">
              {pipelineHealth}%
            </p>
          </div>
        </div>
      </div>

      {/* Recruiter Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5" id="recruiter-stats">
        <div className="bg-white p-5 rounded border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-sm">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">My Job Orders</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">{jobOrders.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">My Candidates</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">{visibleCandidates.length}</h3>
          </div>
        </div>

        {/* Overdue Follow-ups Flagged in Red */}
        <div className={`p-5 rounded border shadow-xs flex items-center gap-4 transition-all ${myFollowups.length > 0 ? 'bg-red-50/80 border-red-200 text-red-950 animate-pulse' : 'bg-white border-slate-200'
          }`}>
          <div className={`p-3 rounded-sm ${myFollowups.length > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-50 text-slate-400'
            }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Overdue Follow-ups</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono underline decoration-2 underline-offset-4">{myFollowups.length}</h3>
          </div>
        </div>
      </div>

      {/* Needs Attention (Overdue reminders list) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-sections">

        {/* Left Column: Overdue Actionables */}
        <div className="lg:col-span-7 bg-white p-6 rounded border border-slate-200 shadow-xs space-y-4" id="dashboard-attention">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Needs Attention (Overdue Actionables)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Surfaced daily follow-up actions that require attention today.</p>
          </div>

          {myFollowups.length === 0 ? (
            <div className="p-10 border border-dashed border-slate-200 rounded bg-slate-50/50 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto stroke-[1.2] mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider">You're all caught up!</p>
              <p className="text-xs mt-1">No overdue follow-up tasks are assigned to you.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100" id="dashboard-followup-list">
              {myFollowups.map(f => {
                const entry = pipelineEntries.find(p => p.id === (f.pipeline_entry_id || f.pipelineEntryId));
                const candidate = entry?.candidate;
                const job = entry?.job_order;

                if (!candidate || !job || !entry) return null;

                const dueDate = new Date(f.due_date);
                const isDone = f.is_done;
                const isOverdue = dueDate < new Date() && !isDone;

                return (
                  <div key={f.id} className="py-3.5 flex items-start justify-between gap-3 first:pt-0 last:pb-0" id={`dashboard-followup-${f.id}`}>
                    <div className="flex items-start gap-2.5">
                      <FollowUpToggle followupId={f.id} isDone={isDone} />
                      <div>
                        <Link
                          href={`?candidateId=${candidate.id}`}
                          scroll={false}
                          className="font-bold text-slate-800 text-xs hover:text-blue-600 text-left cursor-pointer transition-colors block"
                        >
                          {candidate.full_name}
                        </Link>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Assigned to <span className="font-bold text-slate-700">{job.title}</span> pipeline
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-xs font-mono uppercase tracking-wider ${isOverdue ? 'bg-red-50 text-red-800 border border-red-100' : 'bg-slate-100 text-slate-700'
                        }`}>
                        {isOverdue ? 'OVERDUE' : 'DUE'}
                      </span>
                      <span className="text-[10px] text-red-600 font-mono font-bold">
                        Due: {dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Assigned Jobs Quick overview */}
        <div className="lg:col-span-5 bg-white p-6 rounded border border-slate-200 shadow-xs space-y-4" id="dashboard-active-jobs">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-500" />
              My Active Jobs
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Quick access to your open recruitment pipelines.</p>
          </div>

          <div className="space-y-2.5" id="dashboard-jobs-list">
            {visibleJobOrders.filter(j => j.status === 'open').length === 0 ? (
              <p className="text-xs text-slate-400 italic">No open job orders currently assigned to you.</p>
            ) : (
              visibleJobOrders
                .filter(j => j.status === 'open')
                .slice(0, 4)
                .map(job => {
                  const count = pipelineEntries.filter(e => (e.job_order_id || e.jobOrderId) === job.id).length;
                  return (
                    <div
                      key={job.id}
                      className="bg-slate-50 hover:bg-slate-100/80 p-3.5 rounded border border-slate-200 flex items-center justify-between group transition-all"
                    >
                      <div className="min-w-0 pr-2">
                        <h4 className="font-bold text-slate-800 text-xs truncate">{job.title}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 truncate">{job.client_name || job.clientName}</p>
                      </div>
                      <Link
                        href={`/pipeline?jobId=${job.id}`}
                        className="text-[10px] uppercase tracking-widest bg-white text-slate-700 hover:text-blue-600 hover:border-blue-300 py-1.5 px-3 rounded border border-slate-200 font-bold transition-all cursor-pointer shrink-0 shadow-2xs block"
                      >
                        Pipeline ({count}) &rarr;
                      </Link>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* URL-driven Candidate Drawer */}
      <CandidateDetailDrawer candidateId={candidateId} />
    </div>
  );
}