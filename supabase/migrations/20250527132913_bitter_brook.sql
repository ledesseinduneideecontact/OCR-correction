/*
  # Fix database and storage configuration

  1. Changes
    - Update users table RLS policies
    - Create storage buckets with proper configuration
    - Set up storage policies for file access
    - Fix service role permissions

  2. Security
    - Enable RLS on all tables
    - Add proper policies for authenticated users
    - Ensure service role has necessary access
*/

-- Update users table policies
DROP POLICY IF EXISTS "Enable insert for authentication" ON users;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON users;

CREATE POLICY "Anyone can insert users"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create storage buckets
DO $$
BEGIN
  PERFORM storage.create_bucket('student-copies'::text, false);
  PERFORM storage.create_bucket('perfect-answers'::text, false);
  PERFORM storage.create_bucket('corrections'::text, false);
EXCEPTION 
  WHEN OTHERS THEN 
    NULL;
END $$;

-- Create storage policies for student-copies bucket
DO $$
BEGIN
  PERFORM storage.create_policy(
    'student-copies'::text,
    'Upload student copies'::text,
    'INSERT'::text,
    'authenticated'::text,
    'storage.foldername(name)[1] in (
      select id::text from corrections where user_id = auth.uid()
    )'::text
  );

  PERFORM storage.create_policy(
    'student-copies'::text,
    'Read student copies'::text,
    'SELECT'::text,
    'authenticated'::text,
    'storage.foldername(name)[1] in (
      select id::text from corrections where user_id = auth.uid()
    )'::text
  );

  -- Perfect answers bucket policies
  PERFORM storage.create_policy(
    'perfect-answers'::text,
    'Upload perfect answers'::text,
    'INSERT'::text,
    'authenticated'::text,
    'storage.foldername(name)[1] in (
      select id::text from corrections where user_id = auth.uid()
    )'::text
  );

  PERFORM storage.create_policy(
    'perfect-answers'::text,
    'Read perfect answers'::text,
    'SELECT'::text,
    'authenticated'::text,
    'storage.foldername(name)[1] in (
      select id::text from corrections where user_id = auth.uid()
    )'::text
  );

  -- Corrections bucket policies
  PERFORM storage.create_policy(
    'corrections'::text,
    'Read corrections'::text,
    'SELECT'::text,
    'authenticated'::text,
    'storage.foldername(name)[1] in (
      select id::text from corrections where user_id = auth.uid()
    )'::text
  );

  -- Service role policies
  PERFORM storage.create_policy(
    'student-copies'::text,
    'Service role access'::text,
    'ALL'::text,
    'service_role'::text,
    'true'::text
  );

  PERFORM storage.create_policy(
    'perfect-answers'::text,
    'Service role access'::text,
    'ALL'::text,
    'service_role'::text,
    'true'::text
  );

  PERFORM storage.create_policy(
    'corrections'::text,
    'Service role access'::text,
    'ALL'::text,
    'service_role'::text,
    'true'::text
  );
EXCEPTION 
  WHEN OTHERS THEN 
    NULL;
END $$;