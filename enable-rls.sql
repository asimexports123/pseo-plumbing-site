-- Enable RLS and create public read policy for cities_data table
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security on cities_data table
ALTER TABLE cities_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access" ON cities_data;

-- Create policy to allow public read access (anyone can SELECT from this table)
CREATE POLICY "Allow public read access" ON cities_data
  FOR SELECT USING (true);

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'cities_data';
