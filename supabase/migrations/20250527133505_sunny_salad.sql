/*
  # Storage bucket policies update
  
  1. Changes
    - Fix RLS policies for storage buckets
    - Add proper policies for file uploads and downloads
    - Ensure service role has full access
  
  2. Security
    - Enable RLS on storage.objects table
    - Add policies for authenticated users
    - Add policies for service role
*/

-- Enable RLS on objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for student-copies bucket
CREATE POLICY "Allow authenticated users to upload student copies"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'student-copies' AND
  auth.uid() IN (
    SELECT user_id FROM corrections 
    WHERE id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Allow authenticated users to read their student copies"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'student-copies' AND
  auth.uid() IN (
    SELECT user_id FROM corrections 
    WHERE id::text = (storage.foldername(name))[1]
  )
);

-- Create policies for perfect-answers bucket
CREATE POLICY "Allow authenticated users to upload perfect answers"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'perfect-answers' AND
  auth.uid() IN (
    SELECT user_id FROM corrections 
    WHERE id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Allow authenticated users to read their perfect answers"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'perfect-answers' AND
  auth.uid() IN (
    SELECT user_id FROM corrections 
    WHERE id::text = (storage.foldername(name))[1]
  )
);

-- Create policies for corrections bucket
CREATE POLICY "Allow authenticated users to read their corrections"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'corrections' AND
  auth.uid() IN (
    SELECT user_id FROM corrections 
    WHERE id::text = (storage.foldername(name))[1]
  )
);

-- Create policy for service role
CREATE POLICY "Allow service role full access to storage"
ON storage.objects FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Create storage buckets if they don't exist
DO $$
BEGIN
  PERFORM storage.create_bucket('student-copies');
  PERFORM storage.create_bucket('perfect-answers');
  PERFORM storage.create_bucket('corrections');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;