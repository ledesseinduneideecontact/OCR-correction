/*
  # Storage Setup for Opencorrection

  1. Storage Buckets
    - student-copies: Private bucket for student submissions
    - perfect-answers: Private bucket for answer templates
    - corrections: Public bucket for corrected documents
  
  2. Security
    - Add RLS policies for each bucket
    - Ensure proper access control for users and service role
*/

-- Create storage buckets
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES 
    ('student-copies', 'student-copies', false),
    ('perfect-answers', 'perfect-answers', false),
    ('corrections', 'corrections', true);
EXCEPTION
  WHEN unique_violation THEN
    NULL;
END $$;

-- Create storage.objects policies
DO $$ 
BEGIN
  -- Student copies policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can upload student copies'
  ) THEN
    CREATE POLICY "Users can upload student copies"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'student-copies' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can read own student copies'
  ) THEN
    CREATE POLICY "Users can read own student copies"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'student-copies' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  -- Perfect answers policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can upload perfect answers'
  ) THEN
    CREATE POLICY "Users can upload perfect answers"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'perfect-answers' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can read own perfect answers'
  ) THEN
    CREATE POLICY "Users can read own perfect answers"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'perfect-answers' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  -- Corrections policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can read own corrections'
  ) THEN
    CREATE POLICY "Users can read own corrections"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'corrections' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  -- Service role policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Service role has full access'
  ) THEN
    CREATE POLICY "Service role has full access"
      ON storage.objects
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;