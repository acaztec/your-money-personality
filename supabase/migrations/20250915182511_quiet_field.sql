/*
  # Create advisor assessments table

  1. New Tables
    - `advisor_assessments`
      - `id` (text, primary key) - the assessment ID used in URLs
      - `advisor_email` (text) - the advisor who created the assessment
      - `advisor_name` (text) - advisor's name
      - `client_email` (text) - client's email address
      - `client_name` (text, nullable) - client's name if provided
      - `status` (text) - 'sent' or 'completed'
      - `assessment_link` (text) - the full assessment URL
      - `sent_at` (timestamptz) - when assessment was sent
      - `completed_at` (timestamptz, nullable) - when client completed it
      - `created_at` (timestamptz) - record creation time

  2. Security
    - Enable RLS on `advisor_assessments` table
    - Add policy for advisors to read their own assessments
    - Add policy for anyone to read assessment details (needed for clients)
    - Add policy for advisors to insert/update their assessments
*/

CREATE TABLE IF NOT EXISTS advisor_assessments (
  id text PRIMARY KEY,
  advisor_email text NOT NULL,
  advisor_name text NOT NULL,
  client_email text NOT NULL,
  client_name text,
  status text NOT NULL DEFAULT 'sent',
  assessment_link text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE advisor_assessments ENABLE ROW LEVEL SECURITY;

-- Policy for advisors to read their own assessments
CREATE POLICY "Advisors can read own assessments"
  ON advisor_assessments
  FOR SELECT
  TO authenticated
  USING (advisor_email = get_current_user_email());

-- Policy for anyone to read assessment details by ID (needed for clients accessing via link)
CREATE POLICY "Anyone can read assessment by ID"
  ON advisor_assessments
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy for advisors to insert their own assessments
CREATE POLICY "Advisors can create assessments"
  ON advisor_assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (advisor_email = get_current_user_email());

-- Policy for advisors to update their own assessments
CREATE POLICY "Advisors can update own assessments"
  ON advisor_assessments
  FOR UPDATE
  TO authenticated
  USING (advisor_email = get_current_user_email());

-- Policy for anyone to update assessment status (needed for clients completing assessments)
CREATE POLICY "Anyone can update assessment completion status"
  ON advisor_assessments
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS advisor_assessments_advisor_email_idx ON advisor_assessments(advisor_email);
CREATE INDEX IF NOT EXISTS advisor_assessments_status_idx ON advisor_assessments(status);
CREATE INDEX IF NOT EXISTS advisor_assessments_sent_at_idx ON advisor_assessments(sent_at DESC);