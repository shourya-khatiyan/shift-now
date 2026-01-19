-- Fix RLS policy for workers accepting jobs
-- The original policy was missing WITH CHECK clause and auth validation

-- Drop the existing incomplete policy
DROP POLICY IF EXISTS "Workers can accept jobs" ON public.jobs;

-- Create a proper policy that:
-- 1. Allows workers to update open jobs where no worker is assigned
-- 2. Validates that the worker_id being set matches the authenticated user's profile
CREATE POLICY "Workers can accept jobs" 
ON public.jobs FOR UPDATE 
USING (
  -- Can only update jobs that are open and have no worker assigned
  status = 'open' 
  AND worker_id IS NULL
)
WITH CHECK (
  -- The worker_id must be set to the authenticated user's profile id
  worker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  -- And the status must be set to 'accepted'
  AND status = 'accepted'
);

-- Also add a policy for workers to update jobs they've already accepted
-- (e.g., if they need to update their assignment)
CREATE POLICY "Workers can update their accepted jobs" 
ON public.jobs FOR UPDATE 
USING (
  worker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
)
WITH CHECK (
  worker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
