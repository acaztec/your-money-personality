/*
  # Fix Stripe Integration Removal

  This migration properly removes all Stripe-related database objects that were
  partially removed in a previous migration.

  ## Changes

  1. Drop Dependent Objects First
    - Drop views that depend on Stripe tables
    - Drop policies that reference Stripe columns
    - Drop indexes on Stripe-related columns

  2. Remove Stripe Columns
    - Remove stripe_order_id, checkout_session_id from assessment_results
    - Remove is_paid, paid_at, last_checkout_session_id from advisor_assessments

  3. Drop Stripe Tables
    - Drop stripe_subscriptions table
    - Drop stripe_orders table
    - Drop stripe_customers table

  4. Drop Stripe Types
    - Drop custom enum types for Stripe statuses

  5. Restore Original Policies
    - Restore original advisor policies without paywall restrictions
*/

-- Drop dependent views first (if they exist)
DROP VIEW IF EXISTS stripe_user_orders CASCADE;
DROP VIEW IF EXISTS stripe_user_subscriptions CASCADE;

-- Drop policies that reference columns we're about to remove
DROP POLICY IF EXISTS "Advisors can read unlocked assessment results" ON assessment_results;
DROP POLICY IF EXISTS "Advisors can update own assessments" ON advisor_assessments;
DROP POLICY IF EXISTS "Anyone can update assessment completion status" ON advisor_assessments;

-- Remove indexes on columns we're about to drop
DROP INDEX IF EXISTS assessment_results_checkout_session_id_idx;
DROP INDEX IF EXISTS assessment_results_is_unlocked_idx;
DROP INDEX IF EXISTS advisor_assessments_last_checkout_session_id_idx;
DROP INDEX IF EXISTS advisor_assessments_is_paid_idx;

-- Remove Stripe columns from assessment_results
ALTER TABLE assessment_results
  DROP COLUMN IF EXISTS is_unlocked CASCADE,
  DROP COLUMN IF EXISTS unlocked_at CASCADE,
  DROP COLUMN IF EXISTS stripe_order_id CASCADE,
  DROP COLUMN IF EXISTS checkout_session_id CASCADE;

-- Remove Stripe columns from advisor_assessments
ALTER TABLE advisor_assessments
  DROP COLUMN IF EXISTS is_paid CASCADE,
  DROP COLUMN IF EXISTS paid_at CASCADE,
  DROP COLUMN IF EXISTS last_checkout_session_id CASCADE;

-- Drop Stripe tables (CASCADE will drop any remaining constraints)
DROP TABLE IF EXISTS stripe_subscriptions CASCADE;
DROP TABLE IF EXISTS stripe_orders CASCADE;
DROP TABLE IF EXISTS stripe_customers CASCADE;

-- Drop Stripe-specific enum types
DROP TYPE IF EXISTS stripe_subscription_status CASCADE;
DROP TYPE IF EXISTS stripe_order_status CASCADE;

-- Restore original policies without paywall restrictions
CREATE POLICY "Advisors can read own assessment results"
  ON assessment_results
  FOR SELECT
  TO authenticated
  USING (advisor_email = get_current_user_email());

CREATE POLICY "Advisors can update own assessments"
  ON advisor_assessments
  FOR UPDATE
  TO authenticated
  USING (advisor_email = get_current_user_email())
  WITH CHECK (advisor_email = get_current_user_email());

CREATE POLICY "Anyone can update assessment completion status"
  ON advisor_assessments
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (status IN ('sent', 'completed'));
