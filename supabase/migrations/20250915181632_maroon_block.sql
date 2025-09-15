/*
  # Fix Assessment Results RLS Policy

  1. Problem
    - Current RLS policy tries to access auth.users.email directly
    - This causes "permission denied for table users" error
    - advisor_profiles table doesn't have email column

  2. Solution
    - Create a security definer function to safely get current user's email
    - Use this function in the RLS policy instead of direct auth.users access

  3. Security
    - Function runs with elevated privileges (SECURITY DEFINER)
    - Policy allows advisors to see only their own assessment results
*/

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Advisors can read own assessment results" ON assessment_results;

-- Create a security definer function to get current user's email
CREATE OR REPLACE FUNCTION get_current_user_email()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

-- Create new policy using the secure function
CREATE POLICY "Advisors can read own assessment results"
  ON assessment_results
  FOR SELECT
  TO authenticated
  USING (advisor_email = get_current_user_email());

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_current_user_email() TO authenticated;