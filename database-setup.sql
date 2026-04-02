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
  resume text -- URL to uploaded resume
);

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