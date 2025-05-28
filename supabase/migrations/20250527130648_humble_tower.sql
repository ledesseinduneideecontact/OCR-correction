/*
  # Fix users table RLS policies

  1. Changes
    - Update RLS policies for users table to allow proper user creation and access
    - Add policy for user creation during signup
    - Modify existing policies for better security

  2. Security
    - Enable RLS on users table
    - Add policies for authenticated users
    - Add policy for user creation
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create new policies
CREATE POLICY "Enable insert for authentication" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for authenticated users" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on id" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;