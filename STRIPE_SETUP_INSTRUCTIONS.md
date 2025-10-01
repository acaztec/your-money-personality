# Stripe Integration Setup Instructions

## What I've Done (Code Implementation)

✅ Created database migration with Stripe tables and payment tracking columns
✅ Built Stripe webhook endpoint to handle payment events
✅ Created checkout session API endpoint
✅ Added Stripe service for frontend payment flows
✅ Updated advisor dashboard to show payment status
✅ Integrated unlock button with Stripe checkout
✅ Installed Stripe npm package
✅ Updated environment variable files

## What You Need to Do

### Step 1: Run the Database Migration

You need to apply the database migration to add Stripe tables and columns.

**Option A: Using the Supabase MCP tool (if available)**
I can run this command for you if you confirm, or you can do it manually.

**Option B: Manual via Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Copy and paste the contents of `supabase/migrations/20251001120000_add_stripe_integration.sql`
5. Click "Run" to execute the migration

### Step 2: Configure Stripe Webhook

You need to set up a webhook endpoint in Stripe to receive payment events.

1. **Go to Stripe Dashboard**
   - Visit https://dashboard.stripe.com
   - Navigate to **Developers → Webhooks**

2. **Add Webhook Endpoint**
   - Click "Add endpoint"
   - Enter your webhook URL: `https://your-domain.vercel.app/api/stripe-webhook`
   - Replace `your-domain` with your actual Vercel deployment URL

3. **Select Events to Listen To**
   Select these events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`

4. **Get Your Webhook Secret**
   - After creating the webhook, click on it to view details
   - Click "Reveal" next to "Signing secret"
   - Copy this value - you'll need it for Vercel

### Step 3: Verify Vercel Environment Variables

Double-check all your environment variables in Vercel are correctly set:

**Go to Vercel Dashboard:**
1. Select your project
2. Go to Settings → Environment Variables
3. Verify these variables exist and have the correct values:

#### Required Variables:

| Variable Name | Where to Find It | Example Format |
|--------------|------------------|----------------|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Settings → API | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon public | `eyJhbG...` (JWT token) |
| `SUPABASE_URL` | Same as VITE_SUPABASE_URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role | `eyJhbG...` (JWT token - SECRET!) |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API Keys | `sk_test_...` or `sk_live_...` |
| `STRIPE_PRICE_ID` | Stripe Dashboard → Products → Your Product → Pricing | `price_...` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API Keys | `pk_test_...` or `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks → Your webhook | `whsec_...` |

**Important Notes:**
- Make sure all variables are set to "All Environments" (Production, Preview, Development)
- After adding/updating variables, you MUST redeploy for them to take effect

### Step 4: Deploy to Vercel

After ensuring all environment variables are set:

1. **Commit your changes** (if you haven't already)
2. **Push to your Git repository**
3. **Vercel will auto-deploy**, OR manually trigger a deployment:
   - Go to Vercel Dashboard → Deployments
   - Click "Redeploy" on the latest deployment

### Step 5: Test the Integration

After deployment completes:

1. **Test the Payment Flow**
   - Log into your advisor account
   - Navigate to a completed assessment
   - Click "Unlock report"
   - You should be redirected to Stripe Checkout
   - Use a test card: `4242 4242 4242 4242` (any future expiry, any CVC)
   - Complete the payment

2. **Verify Webhook Reception**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click on your webhook endpoint
   - Check the "Events" tab to see if events were received
   - Should show `checkout.session.completed` event

3. **Verify Database Update**
   - Go to Supabase Dashboard → Table Editor
   - Check `stripe_orders` table - should have a new record
   - Check `assessment_results` table - `is_unlocked` should be `true`
   - Check `advisor_assessments` table - `is_paid` should be `true`

4. **Verify Frontend Update**
   - Return to advisor dashboard
   - The assessment should now show "View results" button
   - Click it to view the unlocked report

## Troubleshooting

### Webhook Not Receiving Events

**Check webhook URL is correct:**
- Must be: `https://your-domain.vercel.app/api/stripe-webhook`
- Must be HTTPS (not HTTP)
- Must be your actual deployed domain (not localhost)

**Check webhook secret in Vercel:**
- Make sure `STRIPE_WEBHOOK_SECRET` is set correctly
- The value should start with `whsec_`

### Payment Completes but Assessment Not Unlocked

**Check Stripe webhook logs:**
- Go to Stripe Dashboard → Developers → Webhooks → Your webhook
- Look at the "Events" tab for errors

**Check Vercel function logs:**
- Go to Vercel Dashboard → Your Project → Functions
- Look for `/api/stripe-webhook` logs
- Check for any error messages

**Check Supabase RLS policies:**
- The migration includes permissive policies for development
- Make sure the migration ran successfully

### "Missing metadata" Error in Webhook

This means the checkout session wasn't created with the correct metadata. Check:
- `/api/create-checkout.js` is deployed correctly
- The frontend is calling it with `assessmentId` and `advisorEmail`

## Security Notes for Production

⚠️ **Before going to production**, you should:

1. **Replace permissive RLS policies** in the Stripe tables with proper security:
   - Restrict `stripe_customers` to authenticated users viewing their own data
   - Restrict `stripe_orders` to authenticated users viewing their own orders
   - Add proper checks based on email/user_id

2. **Use Stripe Live Mode**:
   - Replace all test keys with live keys
   - Update webhook endpoint to point to production domain
   - Test thoroughly before going live

3. **Set up proper error handling**:
   - Add error logging/monitoring (e.g., Sentry)
   - Set up alerts for failed webhooks
   - Monitor payment success rates

4. **Add rate limiting**:
   - Prevent abuse of checkout creation endpoint
   - Limit attempts per user/IP

## Summary

**Your action items:**
1. ✅ Run database migration (via Supabase Dashboard SQL Editor)
2. ✅ Create webhook endpoint in Stripe Dashboard
3. ✅ Verify all 8 environment variables in Vercel
4. ✅ Deploy to Vercel (push to Git or manual redeploy)
5. ✅ Test the complete flow with a test payment

**Estimated time:** 15-20 minutes

Once completed, your Stripe payment integration will be fully functional!
