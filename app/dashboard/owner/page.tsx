import { createClient } from '@/lib/supabase/server';
import { RecruiterChart } from './RecruiterChart';
import { 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  Briefcase, 
  Users, 
  CheckCircle 
} from 'lucide-react';

export default async function OwnerDashboardPage() {
  const supabase = await createClient();

  // 1. DIRECT DATABASE FETCHING (Parallel Execution)
  const [recruitersRes, jobOrdersRes, pipelineRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('role', 'recruiter'),
    supabase.from('job_orders').select('*'),
    supabase.from('pipeline_entries').select(`
      *,
      candidate:candidates(*),
      job_order:job_orders(
        *,
        recruiter:profiles(*)
      )
    `)
  ]);

  const recruiters = recruitersRes.data || [];
  const jobOrders = jobOrdersRes.data || [];
  const pipelineEntries = pipelineRes.data || [];

  // 2. SERVER-SIDE METRIC CALCULATIONS
  const totalOpenJobs = jobOrders.filter(j => j.status === 'open').length;
  const totalActivePipeline = pipelineEntries.filter(e => e.stage !== 'Placed' && e.stage !== 'Rejected').length;
  const totalPlacements = pipelineEntries.filter(e => e.stage === 'Placed').length;

  // Process Stalled Candidates List
  const stalledCandidatesList = pipelineEntries
    .filter(entry => entry.stage !== 'Placed' && entry.stage !== 'Rejected')
    .map(entry => {
      const lastUpdate = new Date(entry.stage_updated_at).getTime();
      const today = new Date().getTime();
      const daysStalled = Math.floor(Math.abs(today - lastUpdate) / (1000 * 60 * 60 * 24));
      
      return {
        id: entry.id,
        stage: entry.stage,
        candidateName: entry.candidate?.full_name || 'Unknown Candidate',
        jobTitle: entry.job_order?.title || 'Unknown Position',
        clientName: entry.job_order?.client_name || 'Unknown Client',
        recruiterName: entry.job_order?.recruiter?.full_name || 'Unassigned',
        daysStalled
      };
    })
    .filter(item => item.daysStalled >= 5)
    .sort((a, b) => b.daysStalled - a.daysStalled);

  const stalledCount = stalledCandidatesList.length;
  const pipelineHealth = totalActivePipeline > 0 
    ? Math.round(((totalActivePipeline - stalledCount) / totalActivePipeline) * 100) 
    : 100;

  // Format dataset exclusively for the client-side Recharts component
  const chartData = recruiters.map(recruiter => {
    const recruiterJobs = jobOrders.filter(j => j.recruiter_id === recruiter.id);
    const jobIds = new Set(recruiterJobs.map(j => j.id));
    const entries = pipelineEntries.filter(e => jobIds.has(e.job_order_id));
    
    return {
      name: recruiter.full_name.split(' ')[0],
      'Active Candidates': entries.filter(e => e.stage !== 'Placed' && e.stage !== 'Rejected').length,
      'Placements': entries.filter(e => e.stage === 'Placed').length,
    };
  });

  return (
    <div className="space-y-6" id="owner-dashboard-view">
      
      {/* HEADER SECTION */}
      <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="owner-dashboard-header">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">
            Harborview Agency Analytics
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">
            Placement activities, recruiter pipelines, and stalled profiles.
          </p>
        </div>

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

      {/* METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="owner-stat-cards">
        <div className="bg-white p-5 rounded border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-sm">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Open Job Orders</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">{totalOpenJobs}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Pipelines</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">{totalActivePipeline}</h3>
          </div>
        </div>

        <div className={`p-5 rounded border shadow-sm flex items-center gap-4 transition-colors ${
          stalledCount > 0 ? 'bg-rose-50/60 border-rose-200 text-rose-950' : 'bg-white border-slate-200'
        }`}>
          <div className={`p-3 rounded-sm ${
            stalledCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-400'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Stalled Candidates</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono underline decoration-2 underline-offset-4">
              {stalledCount}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-sm">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Placements</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono italic">{totalPlacements}</h3>
          </div>
        </div>
      </div>

      {/* CHARTS AND BREAKDOWN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="owner-analytics-sections">
        
        {/* Recruiter Performance Bar Chart Container */}
        <div className="lg:col-span-7 bg-white p-6 rounded border border-slate-200 shadow-sm flex flex-col justify-between" id="owner-chart-panel">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Recruiter Performance Leaderboard
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Comparative review of active recruitment pipelines and completed hires.</p>
          </div>
          
          {/* Inject client component data stream safely inside server shell */}
          <RecruiterChart data={chartData} />
        </div>

        {/* Text Metrics Sidebar */}
        <div className="lg:col-span-5 bg-white p-6 rounded border border-slate-200 shadow-sm flex flex-col justify-between" id="owner-numeric-leaderboard">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Recruiter Placement Metrics
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Pipeline throughput counts and metrics per active specialist.</p>
          </div>

          <div className="divide-y divide-slate-100 mt-4 flex-1 flex flex-col justify-center" id="metrics-breakdown">
            {recruiters.map(recruiter => {
              const rJobs = jobOrders.filter(j => j.recruiter_id === recruiter.id);
              const rJobIds = new Set(rJobs.map(j => j.id));
              const rEntries = pipelineEntries.filter(e => rJobIds.has(e.job_order_id));
              const active = rEntries.filter(e => e.stage !== 'Placed' && e.stage !== 'Rejected').length;
              const placed = rEntries.filter(e => e.stage === 'Placed').length;
              
              return (
                <div key={recruiter.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{recruiter.full_name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">{recruiter.email}</p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-[9px] uppercase text-slate-400 font-bold tracking-widest">Active</span>
                      <p className="text-sm font-bold text-slate-800 font-mono">{active}</p>
                    </div>
                    <div className="border-l border-slate-100 pl-4">
                      <span className="text-[9px] uppercase text-slate-400 font-bold tracking-widest">Hired</span>
                      <p className="text-sm font-bold text-emerald-600 font-mono">{placed}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* DRILL DOWN DETAILED TABLE */}
      <div className="bg-white p-6 rounded border border-slate-200 shadow-sm" id="owner-stalled-panel">
        <div className="mb-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            Stalled Candidates (5 or More Days in Current Stage)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">High priority list of candidates that have sat motionless in their pipeline stage, requiring leadership review.</p>
        </div>

        {stalledCount === 0 ? (
          <div className="p-10 text-center text-slate-400 border border-dashed border-slate-200 rounded bg-slate-50/50">
            <p className="text-sm font-medium">All pipelines are active! No stalled candidates identified.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded border border-slate-200" id="owner-stalled-table-wrapper">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase text-[10px] tracking-wider font-mono">
                  <th className="p-3.5 pl-4">Candidate</th>
                  <th className="p-3.5">Position</th>
                  <th className="p-3.5">Current Stage</th>
                  <th className="p-3.5">Assigned Recruiter</th>
                  <th className="p-3.5 pr-4 text-right">Days Stalled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stalledCandidatesList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3.5 pl-4 font-bold text-slate-800">{item.candidateName}</td>
                    <td className="p-3.5 text-slate-500">
                      <div className="font-bold text-slate-700">{item.jobTitle}</div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-400">{item.clientName}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="bg-amber-50 text-amber-800 border border-amber-100 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        {item.stage}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 font-semibold">{item.recruiterName}</td>
                    <td className="p-3.5 pr-4 text-right text-rose-600 font-bold font-mono text-base">
                      {item.daysStalled} days
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}