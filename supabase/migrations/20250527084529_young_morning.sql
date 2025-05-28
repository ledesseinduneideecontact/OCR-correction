/*
  # Initial Schema Setup for Opencorrection

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `credits` (integer)
      - `created_at` (timestamp)
    
    - `corrections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `class_level` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `completed_at` (timestamp)
      - `result_url` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  credits integer DEFAULT 3,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Corrections table
CREATE TABLE IF NOT EXISTS corrections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  class_level text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  result_url text
);

ALTER TABLE corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own corrections"
  ON corrections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own corrections"
  ON corrections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);