import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { JobsViewClient } from './JobsViewClient';

export default async function JobsPage() {
  const supabase = await createClient();

  // 1. Fetch User Session on Server
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch current user profile details
  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single();

  const isRecruiter = currentUserProfile?.role === 'recruiter';

  // 2. Fetch Jobs Data (Filtered if recruiter)
  let jobsQuery = supabase
    .from('job_orders')
    .select('id, title, client_name, status, recruiter_id, created_at')
    .order('created_at', { ascending: false });

  if (isRecruiter) {
    jobsQuery = jobsQuery.eq('recruiter_id', user.id);
  }

  const { data: jobsData } = await jobsQuery;

  // 3. Fetch Recruiters List
  const { data: recruitersData } = await supabase
    .from('profiles')
    .select('id, full_name, role');

  // 4. Fetch Pipeline Candidate Counts per Job
  const { data: pipelineEntries } = await supabase
    .from('pipeline_entries')
    .select('job_order_id');

  // Aggregate count map { [jobOrderId]: count }
  const pipelineCounts: Record<string, number> = {};
  (pipelineEntries || []).forEach((entry) => {
    pipelineCounts[entry.job_order_id] = (pipelineCounts[entry.job_order_id] || 0) + 1;
  });

  // Map to clean UI data structures
  const jobs = (jobsData || []).map((j) => ({
    id: j.id,
    title: j.title,
    clientName: j.client_name,
    status: j.status,
    recruiterId: j.recruiter_id,
  }));

  const recruiters = (recruitersData || []).map((r) => ({
    id: r.id,
    fullName: r.full_name,
    role: r.role,
  }));

  return (
    <JobsViewClient
      initialJobs={jobs}
      recruiters={recruiters}
      pipelineCounts={pipelineCounts}
      currentUser={{
        id: user.id,
        role: currentUserProfile?.role || 'recruiter',
      }}
      isRecruiter={isRecruiter}
    />
  );
}