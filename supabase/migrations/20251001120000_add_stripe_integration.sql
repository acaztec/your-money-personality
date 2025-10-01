/*
  # Add Stripe Integration for Payment Processing

  This migration adds tables and columns needed to track Stripe payments
  for unlocking assessment reports.

  ## New Tables

  1. `stripe_customers`
    - Links user emails to Stripe customer IDs
    - `id` (uuid, primary key)
    - `email` (text, unique) - User's email address
    - `stripe_customer_id` (text, unique) - Stripe customer ID
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  2. `stripe_orders`
    - Tracks one-time payment orders
    - `id` (uuid, primary key)
    - `stripe_customer_id` (text) - References Stripe customer
    - `email` (text) - Customer email
    - `amount` (integer) - Amount in cents
    - `currency` (text) - Currency code (e.g., 'usd')
    - `status` (text) - Order status (pending, completed, failed, refunded)
    - `stripe_payment_intent_id` (text, unique) - Stripe payment intent ID
    - `stripe_checkout_session_id` (text, unique) - Checkout session ID
    - `metadata` (jsonb) - Additional metadata
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Modified Tables

  1. `assessment_results`
    - Add `is_unlocked` (boolean, default false) - Whether advisor has paid to view
    - Add `unlocked_at` (timestamptz, nullable) - When the report was unlocked
    - Add `stripe_order_id` (uuid, nullable) - References stripe_orders
    - Add `checkout_session_id` (text, nullable) - Stripe checkout session ID

  2. `advisor_assessments`
    - Add `is_paid` (boolean, default false) - Whether assessment has been paid for
    - Add `paid_at` (timestamptz, nullable) - When payment was completed
    - Add `last_checkout_session_id` (text, nullable) - Most recent checkout session

  ## Security

  - Basic RLS policies for development (permissive for now)
  - Enable RLS on all new tables
*/

-- Create stripe_customers table
CREATE TABLE IF NOT EXISTS stripe_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  stripe_customer_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stripe_orders table
CREATE TABLE IF NOT EXISTS stripe_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_customer_id text NOT NULL,
  email text NOT NULL,
  amount integer NOT NULL,
  currency text DEFAULT 'usd' NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  stripe_payment_intent_id text UNIQUE,
  stripe_checkout_session_id text UNIQUE NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add columns to assessment_results
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assessment_results' AND column_name = 'is_unlocked'
  ) THEN
    ALTER TABLE assessment_results ADD COLUMN is_unlocked boolean DEFAULT false NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assessment_results' AND column_name = 'unlocked_at'
  ) THEN
    ALTER TABLE assessment_results ADD COLUMN unlocked_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assessment_results' AND column_name = 'stripe_order_id'
  ) THEN
    ALTER TABLE assessment_results ADD COLUMN stripe_order_id uuid REFERENCES stripe_orders(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assessment_results' AND column_name = 'checkout_session_id'
  ) THEN
    ALTER TABLE assessment_results ADD COLUMN checkout_session_id text;
  END IF;
END $$;

-- Add columns to advisor_assessments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'advisor_assessments' AND column_name = 'is_paid'
  ) THEN
    ALTER TABLE advisor_assessments ADD COLUMN is_paid boolean DEFAULT false NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'advisor_assessments' AND column_name = 'paid_at'
  ) THEN
    ALTER TABLE advisor_assessments ADD COLUMN paid_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'advisor_assessments' AND column_name = 'last_checkout_session_id'
  ) THEN
    ALTER TABLE advisor_assessments ADD COLUMN last_checkout_session_id text;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS stripe_customers_email_idx ON stripe_customers(email);
CREATE INDEX IF NOT EXISTS stripe_customers_stripe_id_idx ON stripe_customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS stripe_orders_checkout_session_idx ON stripe_orders(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS stripe_orders_payment_intent_idx ON stripe_orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS stripe_orders_email_idx ON stripe_orders(email);
CREATE INDEX IF NOT EXISTS assessment_results_checkout_session_idx ON assessment_results(checkout_session_id);
CREATE INDEX IF NOT EXISTS assessment_results_is_unlocked_idx ON assessment_results(is_unlocked);
CREATE INDEX IF NOT EXISTS advisor_assessments_is_paid_idx ON advisor_assessments(is_paid);

-- Enable RLS
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development (TEMPORARY - restrict before production)
CREATE POLICY "Allow all access to stripe_customers for development"
  ON stripe_customers
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to stripe_orders for development"
  ON stripe_orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Update existing policies to allow access to new columns
DROP POLICY IF EXISTS "Advisors can read own assessment results" ON assessment_results;
CREATE POLICY "Advisors can read own assessment results"
  ON assessment_results
  FOR SELECT
  TO authenticated
  USING (advisor_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Advisors can update own assessments" ON advisor_assessments;
CREATE POLICY "Advisors can update own assessments"
  ON advisor_assessments
  FOR UPDATE
  TO authenticated
  USING (advisor_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  WITH CHECK (advisor_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
