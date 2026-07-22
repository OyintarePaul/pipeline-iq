import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CandidatesViewClient } from './CandidatesViewClient';
import { CandidateDetailDrawer } from '@/components/CandidateDetailDrawer/CandidateDetailDrawer';

export default async function CandidatesPage({
    searchParams,
}: {
    searchParams: Promise<{ candidateId?: string }>;
}) {
    const { candidateId } = await searchParams;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Fetch all independent data queries concurrently in parallel
    const [
        { data: currentUserProfile },
        { data: candidatesData },
        { data: recruitersData },
        { data: pipelineEntriesData },
    ] = await Promise.all([
        supabase
            .from('profiles')
            .select('id, full_name, role')
            .eq('id', user.id)
            .single(),

        supabase
            .from('candidates')
            .select('id, full_name, email, phone, resume_notes, created_by, created_at')
            .order('created_at', { ascending: false }),

        supabase
            .from('profiles')
            .select('id, full_name, role'),

        supabase
            .from('pipeline_entries')
            .select('id, candidate_id, stage, job_orders(id, title, recruiter_id)'),
    ]);

    const isRecruiter = currentUserProfile?.role === 'recruiter';

    const candidates = (candidatesData || []).map((c) => ({
        id: c.id,
        fullName: c.full_name,
        email: c.email,
        phone: c.phone || '',
        resumeNotes: c.resume_notes || '',
        createdBy: c.created_by,
    }));

    const recruiters = (recruitersData || [])
        .filter((r) => r.role === 'recruiter')
        .map((r) => ({
            id: r.id,
            fullName: r.full_name,
            role: r.role,
        }));

    const pipelineEntries = (pipelineEntriesData || []).map((pe: any) => ({
        id: pe.id,
        candidateId: pe.candidate_id,
        stage: pe.stage,
        jobOrderId: pe.job_orders?.id,
        jobTitle: pe.job_orders?.title,
        recruiterId: pe.job_orders?.recruiter_id,
    }));

    return (
        <>
            <CandidatesViewClient
                initialCandidates={candidates}
                recruiters={recruiters}
                pipelineEntries={pipelineEntries}
                isRecruiter={isRecruiter}
            />
            <CandidateDetailDrawer candidateId={candidateId} />
        </>
    );
}