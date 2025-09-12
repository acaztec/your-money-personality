/*
  # Create assessment results table

  1. New Tables
    - `assessment_results`
      - `id` (uuid, primary key)
      - `assessment_id` (text, unique identifier for the assessment)
      - `advisor_email` (text, advisor who shared the assessment)
      - `client_email` (text, client who took the assessment)
      - `client_name` (text, optional client name)
      - `answers` (jsonb, array of assessment answers)
      - `profile` (jsonb, calculated personality profile)
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `assessment_results` table
    - Add policies for advisors to read their own assessments
*/

CREATE TABLE IF NOT EXISTS assessment_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id text UNIQUE NOT NULL,
  advisor_email text NOT NULL,
  client_email text NOT NULL,
  client_name text,
  answers jsonb NOT NULL,
  profile jsonb NOT NULL,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

-- Policy for advisors to read their own assessment results
CREATE POLICY "Advisors can read own assessment results"
  ON assessment_results
  FOR SELECT
  TO authenticated
  USING (
    advisor_email = (
      SELECT email FROM auth.users 
      WHERE id = auth.uid()
    )
  );

-- Policy for anyone to insert assessment results (needed for clients completing assessments)
CREATE POLICY "Anyone can insert assessment results"
  ON assessment_results
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS assessment_results_advisor_email_idx ON assessment_results(advisor_email);
CREATE INDEX IF NOT EXISTS assessment_results_assessment_id_idx ON assessment_results(assessment_id);
CREATE INDEX IF NOT EXISTS assessment_results_completed_at_idx ON assessment_results(completed_at DESC);