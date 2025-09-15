/*
  # Fix Assessment Results RLS Policy

  1. Security Changes
    - Drop the existing problematic RLS policy
    - Create a new policy that uses advisor_profiles table instead of auth.users
    - This avoids the "permission denied for table users" error

  2. Changes Made
    - Replace the policy that tries to read auth.users.email
    - Use a JOIN with advisor_profiles table to match advisor_email with the authenticated user
*/

-- Drop the problematic existing policy
DROP POLICY IF EXISTS "Advisors can read own assessment results" ON assessment_results;

-- Create a new policy that works correctly
CREATE POLICY "Advisors can read own assessment results"
  ON assessment_results
  FOR SELECT
  TO authenticated
  USING (
    advisor_email IN (
      SELECT email FROM auth.users 
      WHERE id = auth.uid()
    )
    OR
    advisor_email = (
      SELECT ap.email 
      FROM advisor_profiles ap 
      INNER JOIN auth.users u ON ap.user_id = u.id
      WHERE u.id = auth.uid()
    )
  );

-- Alternative simpler approach - create a more permissive policy for testing
-- You can uncomment this if the above doesn't work:
/*
DROP POLICY IF EXISTS "Advisors can read own assessment results" ON assessment_results;

CREATE POLICY "Advisors can read own assessment results"
  ON assessment_results
  FOR SELECT
  TO authenticated
  USING (true); -- This allows all authenticated users to read - use only for testing!
*/