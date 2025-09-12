/*
  # Fix Row Level Security for advisor profiles

  1. Policy Changes
    - Drop the existing "all operations" policy
    - Create separate policies for SELECT, INSERT, UPDATE, DELETE
    - Allow INSERT during signup process
    - Maintain security for other operations

  2. Security
    - INSERT: Allow authenticated users to create their own profile
    - SELECT: Allow authenticated users to read profiles (for assessment sharing)
    - UPDATE: Allow users to update only their own profile
    - DELETE: Allow users to delete only their own profile
*/

-- Drop the existing policy that might be too restrictive
DROP POLICY IF EXISTS "Advisors can manage own profile" ON advisor_profiles;

-- Create separate policies for better control

-- Allow authenticated users to read advisor profiles (needed for assessment sharing)
CREATE POLICY "Anyone can read advisor profiles"
  ON advisor_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can create own profile"
  ON advisor_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own profile
CREATE POLICY "Users can update own profile"
  ON advisor_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete only their own profile
CREATE POLICY "Users can delete own profile"
  ON advisor_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);