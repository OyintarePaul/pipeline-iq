import "server-only";

import { createClient } from '@/lib/supabase/server' // or browser client depending on your setup

export async function getJobPipelineData(jobOrderId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('job_orders')
    .select(`
      id,
      title,
      client_name,
      status,
      pipeline_entries (
        id,
        stage,
        stage_updated_at,
        candidates (
          id,
          full_name,
          email,
          phone
        )
      )
    `)
    .eq('id', jobOrderId)
    .single()

  if (error) throw error
  return data
}

export async function getOwnerDashboardData() {
  const supabase = await createClient()

  // 1. Get total open jobs & pipeline count
  const jobsPromise = supabase.from('job_orders').select('id', { count: 'exact' }).eq('status', 'open')
  const pipelinePromise = supabase.from('pipeline_entries').select('id', { count: 'exact' })
  
  // 2. Query candidates sitting stagnant in an active stage for more than 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const stalledPromise = supabase
    .from('pipeline_entries')
    .select(`
      id, 
      stage, 
      stage_updated_at,
      candidates ( full_name ),
      job_orders ( title )
    `)
    .not('stage', 'in', '("Placed","Rejected")')
    .lt('stage_updated_at', sevenDaysAgo.toISOString())

  // 3. Recruiter Leadboard count breakdown
  const leaderboardPromise = supabase
    .from('profiles')
    .select(`
      full_name,
      job_orders (
        id,
        pipeline_entries ( id, stage )
      )
    `)
    .eq('role', 'recruiter')

  const [jobs, pipeline, stalled, leaderboard] = await Promise.all([
    jobsPromise, pipelinePromise, stalledPromise, leaderboardPromise
  ])

  return {
    openJobsCount: jobs.count || 0,
    totalCandidates: pipeline.count || 0,
    stalledCandidates: stalled.data || [],
    leaderboard: leaderboard.data || []
  }
}