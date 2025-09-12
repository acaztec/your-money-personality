/*
  # Disable RLS and remove policies for advisor profiles

  1. Security
    - Disable Row Level Security
    - Drop any existing policies
*/

ALTER TABLE advisor_profiles DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read advisor profiles" ON advisor_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON advisor_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON advisor_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON advisor_profiles;
DROP POLICY IF EXISTS "Advisors can manage own profile" ON advisor_profiles;
