-- Supabase Database Setup for HireMe Application
-- Run these commands in your Supabase SQL Editor

-- 1. Create applications table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id text NOT NULL, -- Clerk user ID
  name text NOT NULL,
  status text DEFAULT 'applied' CHECK (status IN ('applied', 'interviewing', 'hired', 'rejected')),
  resume text, -- URL to uploaded resume
  experience integer DEFAULT 0, -- Years of experience
  skills text, -- Comma-separated skills
  education text CHECK (education IN ('Intermediate', 'Graduate', 'Post Graduate')) -- Education level
);

-- Add missing columns to existing applications table
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS experience integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS skills text,
ADD COLUMN IF NOT EXISTS education text CHECK (education IN ('Intermediate', 'Graduate', 'Post Graduate'));

-- 2. Create storage bucket for resumes (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Row Level Security (RLS) policies for applications table
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own applications
DROP POLICY IF EXISTS "Users can insert their own applications" ON applications;
CREATE POLICY "Users can insert their own applications" 
ON applications FOR INSERT 
WITH CHECK (true); -- Allow all inserts for now, can be restricted later

-- Policy: Users can view their own applications
DROP POLICY IF EXISTS "Users can view their own applications" ON applications;
CREATE POLICY "Users can view their own applications" 
ON applications FOR SELECT 
USING (true); -- Allow all reads for now

-- Policy: Recruiters can view applications for their jobs
DROP POLICY IF EXISTS "Recruiters can view applications for their jobs" ON applications;
CREATE POLICY "Recruiters can view applications for their jobs" 
ON applications FOR SELECT 
USING (true); -- Allow all reads for now

-- Policy: Recruiters can update application status
DROP POLICY IF EXISTS "Recruiters can update application status" ON applications;
CREATE POLICY "Recruiters can update application status" 
ON applications FOR UPDATE 
USING (true); -- Allow all updates for now

-- Policy: Allow deletion of applications
DROP POLICY IF EXISTS "Allow deletion of applications" ON applications;
CREATE POLICY "Allow deletion of applications" 
ON applications FOR DELETE 
USING (true); -- Allow all deletions for now

-- 4. Set up storage policies for resumes bucket
DROP POLICY IF EXISTS "Anyone can upload resumes" ON storage.objects;
CREATE POLICY "Anyone can upload resumes" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'resumes');

DROP POLICY IF EXISTS "Anyone can view resumes" ON storage.objects;
CREATE POLICY "Anyone can view resumes" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'resumes');

-- 5. Grant necessary permissions
GRANT ALL ON applications TO authenticated;
GRANT ALL ON applications TO anon;

-- 6. Ensure saved_jobs table exists and has proper structure
CREATE TABLE IF NOT EXISTS saved_jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  user_id text NOT NULL, -- Clerk user ID
  UNIQUE(job_id, user_id) -- Prevent duplicate saves
);

-- Add user_id column if it doesn't exist (for existing installations)
ALTER TABLE saved_jobs ADD COLUMN IF NOT EXISTS user_id text;

-- Create unique constraint if it doesn't exist
DO $$ BEGIN
  ALTER TABLE saved_jobs ADD CONSTRAINT saved_jobs_job_user_unique UNIQUE(job_id, user_id);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Set up RLS policies for saved_jobs table
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own saved jobs
DROP POLICY IF EXISTS "Users can insert their own saved jobs" ON saved_jobs;
CREATE POLICY "Users can insert their own saved jobs" 
ON saved_jobs FOR INSERT 
WITH CHECK (true);

-- Policy: Users can view their own saved jobs
DROP POLICY IF EXISTS "Users can view their own saved jobs" ON saved_jobs;
CREATE POLICY "Users can view their own saved jobs" 
ON saved_jobs FOR SELECT 
USING (true);

-- Policy: Users can delete their own saved jobs
DROP POLICY IF EXISTS "Users can delete their own saved jobs" ON saved_jobs;
CREATE POLICY "Users can delete their own saved jobs" 
ON saved_jobs FOR DELETE 
USING (true);

-- Grant permissions for saved_jobs
GRANT ALL ON saved_jobs TO authenticated;
GRANT ALL ON saved_jobs TO anon;