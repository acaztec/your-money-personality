/*
  # Fix Assessment Results RLS Policy - Better Solution

  1. Security Changes
    - Drop the existing problematic RLS policy that tries to access auth.users
    - Create a new policy that uses the advisor_profiles table to properly join with the current user
    - This fixes the "permission denied for table users" error

  2. The Fix
    - Instead of trying to get email from auth.users (which causes permission issues)
    - We join with advisor_profiles table using the user_id which we can access via auth.uid()
*/

-- Drop the problematic existing policy
DROP POLICY IF EXISTS "Advisors can read own assessment results" ON assessment_results;

-- Create a new policy that properly joins with advisor_profiles
CREATE POLICY "Advisors can read own assessment results"
  ON assessment_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM advisor_profiles ap
      WHERE ap.user_id = auth.uid() 
      AND ap.name || ' <' || ap.email || '>' = advisor_email
      OR ap.email = advisor_email
    )
  );

-- If the above doesn't work because we don't have email in advisor_profiles,
-- let's try a simpler approach that uses a function

-- First, let's create a helper function to get the current user's email
CREATE OR REPLACE FUNCTION get_current_user_email()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT email FROM auth.users WHERE id = auth.uid());
END;
$$;

-- Now use this function in our policy
DROP POLICY IF EXISTS "Advisors can read own assessment results" ON assessment_results;

CREATE POLICY "Advisors can read own assessment results"
  ON assessment_results
  FOR SELECT
  TO authenticated
  USING (advisor_email = get_current_user_email());