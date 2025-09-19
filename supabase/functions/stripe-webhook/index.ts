import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

console.log('🚀 Stripe webhook function starting up...');

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const projectUrl = Deno.env.get('PROJECT_URL');
const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY');

if (!stripeSecret || !stripeWebhookSecret || !projectUrl || !serviceRoleKey) {
  console.error('❌ Missing required environment variables');
  console.log('Environment check:', {
    hasStripeSecret: !!stripeSecret,
    hasWebhookSecret: !!stripeWebhookSecret,
    hasProjectUrl: !!projectUrl,
    hasServiceKey: !!serviceRoleKey
  });
}

const stripe = new Stripe(stripeSecret!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(projectUrl!, serviceRoleKey!);

Deno.serve(async (req) => {
  console.log('📞 Webhook request received:', req.method, req.url);
  console.log('📋 Request headers:', Object.fromEntries(req.headers.entries()));
  
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      console.log('✅ Handling CORS preflight');
      return new Response(null, { 
        status: 200, 
        headers: corsHeaders 
      });
    }

    // Only allow POST
    if (req.method !== 'POST') {
      console.log('❌ Invalid method:', req.method);
      return new Response('Method not allowed', { 
        status: 405,
        headers: corsHeaders
      });
    }

    // Get Stripe signature
    const signature = req.headers.get('stripe-signature');
    console.log('🔑 Stripe signature present:', !!signature);

    if (!signature) {
      console.log('❌ No Stripe signature found in headers');
      return new Response('No Stripe signature found', { 
        status: 400,
        headers: corsHeaders
      });
    }

    // Get raw body
    const body = await req.text();
    console.log('📝 Request body length:', body.length);

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      console.log('🔐 Verifying webhook signature...');
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret!);
      console.log('✅ Webhook signature verified, event type:', event.type);
    } catch (error: any) {
      console.error(`❌ Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { 
        status: 400,
        headers: corsHeaders
      });
    }

    // Process the event
    console.log('🎯 Processing event:', event.type);
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('💳 Processing checkout session:', session.id);
      
      // Only process payment mode (not subscription)
      if (session.mode === 'payment' && session.payment_status === 'paid') {
        console.log('💰 Payment completed, processing unlock...');
        
        const assessmentId = session.metadata?.assessment_id || session.client_reference_id;
        const advisorEmail = session.metadata?.advisor_email;
        
        console.log('📋 Assessment details:', { assessmentId, advisorEmail });
        
        if (!assessmentId) {
          console.warn('⚠️ No assessment ID found in session metadata');
          return new Response(JSON.stringify({ received: true, warning: 'No assessment ID' }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const now = new Date().toISOString();

        // Update advisor_assessments table
        console.log('📝 Updating advisor_assessments...');
        const { error: assessmentError } = await supabase
          .from('advisor_assessments')
          .update({
            is_paid: true,
            paid_at: now,
            last_checkout_session_id: session.id,
          })
          .eq('id', assessmentId);

        if (assessmentError) {
          console.error('❌ Failed to update advisor_assessments:', assessmentError);
        } else {
          console.log('✅ advisor_assessments updated successfully');
        }

        // Update assessment_results table
        console.log('📝 Updating assessment_results...');
        const { error: resultError } = await supabase
          .from('assessment_results')
          .update({
            is_unlocked: true,
            unlocked_at: now,
            checkout_session_id: session.id,
          })
          .eq('assessment_id', assessmentId);

        if (resultError) {
          console.error('❌ Failed to update assessment_results:', resultError);
        } else {
          console.log('✅ assessment_results updated successfully');
        }

        // Insert order record
        console.log('💾 Inserting order record...');
        const { error: orderError } = await supabase
          .from('stripe_orders')
          .upsert({
            checkout_session_id: session.id,
            payment_intent_id: typeof session.payment_intent === 'string' 
              ? session.payment_intent 
              : session.payment_intent?.id || 'unknown',
            customer_id: session.customer as string || 'unknown',
            amount_subtotal: session.amount_subtotal || 0,
            amount_total: session.amount_total || 0,
            currency: session.currency || 'usd',
            payment_status: session.payment_status || 'unknown',
            status: 'completed',
            assessment_id: assessmentId,
            advisor_email: advisorEmail,
            metadata: session.metadata || {},
          }, {
            onConflict: 'checkout_session_id'
          });

        if (orderError) {
          console.error('❌ Failed to insert order:', orderError);
        } else {
          console.log('✅ Order record inserted successfully');
        }

        console.log('🎉 Webhook processing completed successfully!');
      } else {
        console.log('⏩ Skipping non-payment or unpaid session');
      }
    } else {
      console.log('⏩ Skipping non-checkout event:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('💥 Error processing webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});