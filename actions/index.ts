'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type ActionResponse = { success: boolean; error?: string } | null;

/**
 * 1. KANBAN BOARD: Move Candidate Stage
 * Triggered when a card is dropped into a new column.
 */

export async function updatePipelineStageAction(entryId: string, newStage: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('pipeline_entries')
    .update({
      stage: newStage,
    })
    .eq('id', entryId);

  if (error) {
    console.error('Failed to update pipeline stage:', error.message);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/pipeline');
  return { success: true };
}

export async function addCandidateToPipelineAction(candidateId: string, jobId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('pipeline_entries')
    .insert({
      candidate_id: candidateId,
      job_order_id: jobId,
      stage: 'Sourced',
    });

  if (error) {
    console.error('Failed to add candidate to pipeline:', error.message);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/pipeline');
  return { success: true };
}

/**
 * 2. CANDIDATE DETAIL: Add a History Note
 */
export async function addCandidateNoteAction(pipelineEntryId: string, content: string): Promise<ActionResponse> {
  const supabase = await createClient()

  // Get current logged-in user for the author_id trail
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('notes')
    .insert({
      pipeline_entry_id: pipelineEntryId,
      author_id: user.id,
      content: content
    })

  if (error) return { success: false, error: error.message }

  revalidatePath(`/candidates/${pipelineEntryId}`)
  return { success: true }
}

/**
 * 3. DASHBOARD / DETAIL: Complete a Follow-Up Reminder
 */
export async function toggleFollowUpStatusAction(followUpId: string, isDone: boolean): Promise<ActionResponse> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('follow_ups')
    .update({ is_done: isDone })
    .eq('id', followUpId)

  if (error) return { success: false, error: error.message }

  // Revalidate dashboards and lists to clear out the completed task
  revalidatePath('/dashboard')
  return { success: true }
}

export async function addFollowUpAction(pipelineEntryId: string, dueDate: string): Promise<ActionResponse> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase.from('follow_ups').insert({
    pipeline_entry_id: pipelineEntryId,
    due_date: dueDate,
    is_done: false,
    created_by: user.id
  });

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard');
  return { success: true }
}

/**
 * Create New Job Order
 */
export async function createJobOrderAction(
  _prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const title = (formData.get('title') as string)?.trim();
  const clientName = (formData.get('client_name') as string)?.trim();
  const recruiterId = (formData.get('recruiter_id') as string) || user.id;

  if (!title || !clientName) {
    return { success: false, error: 'Job title and client name are required.' };
  }

  const { error } = await supabase
    .from('job_orders')
    .insert({
      title,
      client_name: clientName,
      recruiter_id: recruiterId,
      status: 'open'
    });

  if (error) return { success: false, error: error.message };

  revalidatePath('/jobs');
  return { success: true };
}

/**
 * Update Job Order Status Inline
 */
export async function updateJobStatusAction(jobId: string, newStatus: string): Promise<ActionResponse> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('job_orders')
    .update({ status: newStatus })
    .eq('id', jobId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/jobs');
  return { success: true };
}



export async function createCandidateAction(
  _prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const fullName = (formData.get('full_name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim() || null;
  const resumeNotes = (formData.get('resume_notes') as string)?.trim() || null;

  if (!fullName || !email) {
    return { success: false, error: 'Full name and email address are required.' };
  }

  const { error } = await supabase.from('candidates').insert({
    full_name: fullName,
    email,
    phone,
    resume_notes: resumeNotes,
    created_by: user.id,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath('/candidates');
  return { success: true };
}