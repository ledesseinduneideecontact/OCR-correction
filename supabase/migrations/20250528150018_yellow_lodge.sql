/*
  # Storage bucket policies update
  
  1. Changes
    - Fix RLS policies for storage buckets
    - Add proper policies for file uploads and downloads
    - Ensure service role has full access
  
  2. Security
    - Use storage schema functions to manage policies
    - Add policies for authenticated users
    - Add policies for service role
*/

-- Create storage buckets if they don't exist
SELECT storage.create_bucket('student-copies', false);
SELECT storage.create_bucket('perfect-answers', false);
SELECT storage.create_bucket('corrections', false);

-- Create policies for student-copies bucket
SELECT storage.create_policy(
  'student-copies',
  'Upload student copies',
  'INSERT',
  'authenticated',
  storage.foldername(name)[1] IN (
    SELECT id::text FROM corrections WHERE user_id = auth.uid()
  )::text
);

SELECT storage.create_policy(
  'student-copies',
  'Read student copies',
  'SELECT',
  'authenticated',
  storage.foldername(name)[1] IN (
    SELECT id::text FROM corrections WHERE user_id = auth.uid()
  )::text
);

-- Create policies for perfect-answers bucket
SELECT storage.create_policy(
  'perfect-answers',
  'Upload perfect answers',
  'INSERT',
  'authenticated',
  storage.foldername(name)[1] IN (
    SELECT id::text FROM corrections WHERE user_id = auth.uid()
  )::text
);

SELECT storage.create_policy(
  'perfect-answers',
  'Read perfect answers',
  'SELECT',
  'authenticated',
  storage.foldername(name)[1] IN (
    SELECT id::text FROM corrections WHERE user_id = auth.uid()
  )::text
);

-- Create policies for corrections bucket
SELECT storage.create_policy(
  'corrections',
  'Read corrections',
  'SELECT',
  'authenticated',
  storage.foldername(name)[1] IN (
    SELECT id::text FROM corrections WHERE user_id = auth.uid()
  )::text
);

-- Create service role policies for all buckets
SELECT storage.create_policy(
  'student-copies',
  'Service role access',
  'ALL',
  'service_role',
  'true'::text
);

SELECT storage.create_policy(
  'perfect-answers',
  'Service role access',
  'ALL',
  'service_role',
  'true'::text
);

SELECT storage.create_policy(
  'corrections',
  'Service role access',
  'ALL',
  'service_role',
  'true'::text
);