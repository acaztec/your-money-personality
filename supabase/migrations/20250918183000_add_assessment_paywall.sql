/*
  # Add paywall controls for advisor assessment results

  1. Data model updates
    - Track unlock state for assessment results
    - Store payment metadata on advisor assessments and Stripe orders

  2. Security updates
    - Restrict advisors to unlocked results only
    - Prevent public updates from toggling paid fields
*/

BEGIN;

-- Track payment state on assessment results
ALTER TABLE assessment_results
  ADD COLUMN IF NOT EXISTS is_unlocked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS unlocked_at timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_order_id bigint REFERENCES stripe_orders(id),
  ADD COLUMN IF NOT EXISTS checkout_session_id text;

CREATE INDEX IF NOT EXISTS assessment_results_is_unlocked_idx ON assessment_results(is_unlocked);
CREATE UNIQUE INDEX IF NOT EXISTS assessment_results_checkout_session_id_idx
  ON assessment_results(checkout_session_id)
  WHERE checkout_session_id IS NOT NULL;

-- Track payment state on advisor assessments
ALTER TABLE advisor_assessments
  ADD COLUMN IF NOT EXISTS is_paid boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_checkout_session_id text;

CREATE INDEX IF NOT EXISTS advisor_assessments_is_paid_idx ON advisor_assessments(is_paid);
CREATE UNIQUE INDEX IF NOT EXISTS advisor_assessments_last_checkout_session_id_idx
  ON advisor_assessments(last_checkout_session_id)
  WHERE last_checkout_session_id IS NOT NULL;

-- Store metadata about the purchase
ALTER TABLE stripe_orders
  ADD COLUMN IF NOT EXISTS assessment_id text,
  ADD COLUMN IF NOT EXISTS advisor_email text,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

ALTER TABLE stripe_orders
  ADD CONSTRAINT stripe_orders_checkout_session_id_key UNIQUE (checkout_session_id);

CREATE INDEX IF NOT EXISTS stripe_orders_assessment_id_idx ON stripe_orders(assessment_id);

-- Ensure advisors only read unlocked results
DROP POLICY IF EXISTS "Advisors can read own assessment results" ON assessment_results;

CREATE POLICY "Advisors can read unlocked assessment results"
  ON assessment_results
  FOR SELECT
  TO authenticated
  USING (
    advisor_email = get_current_user_email()
    AND is_unlocked = true
  );

-- Prevent advisors from toggling paid fields directly
DROP POLICY IF EXISTS "Advisors can update own assessments" ON advisor_assessments;

CREATE POLICY "Advisors can update own assessments"
  ON advisor_assessments
  FOR UPDATE
  TO authenticated
  USING (advisor_email = get_current_user_email())
  WITH CHECK (
    advisor_email = get_current_user_email()
    AND (is_paid = false OR is_paid IS NULL)
    AND paid_at IS NULL
    AND last_checkout_session_id IS NULL
  );

-- Ensure public completion updates cannot unlock paid data
DROP POLICY IF EXISTS "Anyone can update assessment completion status" ON advisor_assessments;

CREATE POLICY "Anyone can update assessment completion status"
  ON advisor_assessments
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (
    status IN ('sent', 'completed')
    AND (is_paid = false OR is_paid IS NULL)
    AND paid_at IS NULL
    AND last_checkout_session_id IS NULL
  );

COMMIT;
