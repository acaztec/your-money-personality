/*
  # Remove Stripe integration

  1. Remove Stripe-specific objects
  2. Drop Stripe metadata columns from assessment tables
*/

BEGIN;

-- Drop dependent views first
DROP VIEW IF EXISTS stripe_user_orders;
DROP VIEW IF EXISTS stripe_user_subscriptions;

-- Remove Stripe metadata from assessment tables
DROP INDEX IF EXISTS assessment_results_checkout_session_id_idx;
ALTER TABLE assessment_results
  DROP COLUMN IF EXISTS stripe_order_id,
  DROP COLUMN IF EXISTS checkout_session_id;

DROP INDEX IF EXISTS advisor_assessments_last_checkout_session_id_idx;
ALTER TABLE advisor_assessments
  DROP COLUMN IF EXISTS last_checkout_session_id;

-- Drop Stripe tables
DROP TABLE IF EXISTS stripe_subscriptions;
DROP TABLE IF EXISTS stripe_orders;
DROP TABLE IF EXISTS stripe_customers;

-- Drop Stripe-specific enum types
DROP TYPE IF EXISTS stripe_subscription_status;
DROP TYPE IF EXISTS stripe_order_status;

COMMIT;
