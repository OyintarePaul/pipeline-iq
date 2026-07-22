import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { KanbanClient } from './KanbanClient';
import { CandidateDetailDrawer } from '@/components/CandidateDetailDrawer/CandidateDetailDrawer';

interface PageProps {
  searchParams: Promise<{ jobId?: string; candidateId?: string }>;
}

export default async function PipelinePage({ searchParams }: PageProps) {
  const { jobId, candidateId } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  if (!jobId) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p className="text-lg font-medium">No job selected.</p>
        <Link href="/dashboard/jobs" className="mt-4 inline-block text-indigo-600 hover:underline text-sm font-semibold">
          &larr; Return to Jobs List
        </Link>
      </div>
    );
  }

  // Fetch job details, entries with candidates, and all candidate options in parallel
  const [jobRes, entriesRes, candidatesRes] = await Promise.all([
    supabase
      .from('job_orders')
      .select('id, title, client_name, status')
      .eq('id', jobId)
      .single(),

    supabase
      .from('pipeline_entries')
      .select(`
        id,
        stage,
        stage_updated_at,
        candidate_id,
        candidates (
          id,
          full_name,
          email
        )
      `)
      .eq('job_order_id', jobId),

    supabase
      .from('candidates')
      .select('id, full_name')
      .order('full_name', { ascending: true })
  ]);

  if (jobRes.error || !jobRes.data) {
    return (
      <div className="p-12 text-center text-slate-500" id="kanban-error">
        <p className="text-lg font-medium">Job order not found or access restricted.</p>
        <Link href="/dashboard/jobs" className="mt-4 inline-block text-indigo-600 hover:underline text-sm font-semibold">
          &larr; Back to Jobs
        </Link>
      </div>
    );
  }

  const job = {
    id: jobRes.data.id,
    title: jobRes.data.title,
    clientName: jobRes.data.client_name,
    status: jobRes.data.status,
  };

  const entries = (entriesRes.data || []).map((e: any) => ({
    id: e.id,
    candidateId: e.candidate_id,
    stage: e.stage,
    stageUpdatedAt: e.stage_updated_at,
    candidate: {
      id: e.candidates?.id,
      fullName: e.candidates?.full_name || 'Unknown Candidate',
      email: e.candidates?.email || '',
    }
  }));

  // Filter candidates not yet attached to this job pipeline
  const attachedCandidateIds = new Set(entries.map((e) => e.candidateId));
  const availableCandidates = (candidatesRes.data || [])
    .filter((c) => !attachedCandidateIds.has(c.id))
    .map((c) => ({
      id: c.id,
      fullName: c.full_name,
    }));

  return (
    <>
      <KanbanClient
        job={job}
        initialEntries={entries}
        availableCandidates={availableCandidates}
      />
      <CandidateDetailDrawer candidateId={candidateId} />
    </>
  );
}