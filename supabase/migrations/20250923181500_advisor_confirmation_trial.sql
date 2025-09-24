-- Add tracking for advisor confirmation emails and introductory trial flags
ALTER TABLE advisor_assessments
  ADD COLUMN IF NOT EXISTS is_trial boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS confirmation_sent_at timestamptz;

CREATE INDEX IF NOT EXISTS advisor_assessments_is_trial_idx
  ON advisor_assessments(is_trial);

CREATE INDEX IF NOT EXISTS advisor_assessments_confirmation_sent_at_idx
  ON advisor_assessments(confirmation_sent_at DESC);
