/*
  # Create advisor profiles table

  1. New Tables
    - `advisor_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `company` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `advisor_profiles` table
    - Add policies for advisors to read/update their own profile
    - Add policies for authenticated advisors to read other advisor profiles (for assessment sharing)
*/

CREATE TABLE IF NOT EXISTS advisor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  company text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE advisor_profiles ENABLE ROW LEVEL SECURITY;

-- Advisors can read and update their own profile
CREATE POLICY "Advisors can manage own profile"
  ON advisor_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can read advisor profiles (for assessment sharing)
CREATE POLICY "Authenticated users can read advisor profiles"
  ON advisor_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_advisor_profiles_updated_at
  BEFORE UPDATE ON advisor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index on user_id for performance
CREATE INDEX IF NOT EXISTS advisor_profiles_user_id_idx ON advisor_profiles(user_id);