-- ===========================================
-- Migration: Create Jobs Table
-- ===========================================

-- Create jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    photo_url TEXT,
    inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
    outputs JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS jobs_user_id_idx ON public.jobs(user_id);
CREATE INDEX IF NOT EXISTS jobs_created_at_idx ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS jobs_inputs_job_type_idx ON public.jobs((inputs->>'jobType'));

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for jobs
-- Users can view their own jobs
CREATE POLICY "Users can view own jobs"
    ON public.jobs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own jobs
CREATE POLICY "Users can insert own jobs"
    ON public.jobs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own jobs
CREATE POLICY "Users can update own jobs"
    ON public.jobs
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own jobs
CREATE POLICY "Users can delete own jobs"
    ON public.jobs
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
