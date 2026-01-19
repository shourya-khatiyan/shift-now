-- Comprehensive RLS Policy Fixes for SHIFT NOW
-- Run this entire script in your Supabase SQL Editor to fix all permission issues

-- 1. Enable RLS on all tables (best practice)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- 2. PUBLIC PROFILES POLICIES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- 3. JOBS POLICIES
-- Allow everyone to view open jobs
DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON public.jobs;
CREATE POLICY "Jobs are viewable by everyone" 
ON public.jobs FOR SELECT USING (true);

-- Employers can create jobs
DROP POLICY IF EXISTS "Employers can create jobs" ON public.jobs;
CREATE POLICY "Employers can create jobs" 
ON public.jobs FOR INSERT 
WITH CHECK (employer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Employers can update their own jobs
DROP POLICY IF EXISTS "Employers can update their jobs" ON public.jobs;
CREATE POLICY "Employers can update their jobs" 
ON public.jobs FOR UPDATE 
USING (employer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- WORKER JOB ACCEPTANCE (Critical Fix)
DROP POLICY IF EXISTS "Workers can accept jobs" ON public.jobs;
CREATE POLICY "Workers can accept jobs" 
ON public.jobs FOR UPDATE 
USING (
  status = 'open' 
  AND worker_id IS NULL
)
WITH CHECK (
  worker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  AND status = 'accepted'
);

-- Workers can update jobs they have accepted (e.g. to mark as completed if logic changes, currently employer does this)
-- But primarily this allows them to 'see' and interact with their assigned jobs in UPDATE contexts if needed
DROP POLICY IF EXISTS "Workers can update their accepted jobs" ON public.jobs;
CREATE POLICY "Workers can update their accepted jobs" 
ON public.jobs FOR UPDATE 
USING (worker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- 4. RATINGS POLICIES
DROP POLICY IF EXISTS "Ratings are viewable by everyone" ON public.ratings;
CREATE POLICY "Ratings are viewable by everyone" 
ON public.ratings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create ratings" ON public.ratings;
CREATE POLICY "Users can create ratings" 
ON public.ratings FOR INSERT 
WITH CHECK (rater_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- 5. GRANT PERMISSIONS
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
