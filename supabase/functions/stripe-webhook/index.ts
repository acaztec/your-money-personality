import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(Deno.env.get('PROJECT_URL')!, Deno.env.get('SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  console.log('🚀 Webhook received request:', req.method, req.url);
  
  try {
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      console.log('✅ Handling CORS preflight');
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      console.log('❌ Invalid method:', req.method);
      return new Response('Method not allowed', { status: 405 });
    }

    // get the signature from the header
    const signature = req.headers.get('stripe-signature');
    console.log('🔑 Stripe signature present:', !!signature);

    if (!signature) {
      console.log('❌ No signature found in headers');
      return new Response('No signature found', { status: 400 });
    }

    // get the raw body
    const body = await req.text();
    console.log('📝 Request body length:', body.length);

    // verify the webhook signature
    let event: Stripe.Event;

    try {
      console.log('🔐 Verifying webhook signature...');
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
      console.log('✅ Webhook signature verified, event type:', event.type);
    } catch (error: any) {
      console.error(`❌ Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
    }

    console.log('🎯 Processing event:', event.type, 'with ID:', event.id);
    EdgeRuntime.waitUntil(handleEvent(event));

    console.log('✅ Webhook processed successfully');
    return Response.json({ received: true });
  } catch (error: any) {
    console.error('💥 Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  console.log('🔄 Starting handleEvent for:', event.type);
  
  const stripeData = event?.data?.object ?? {};
  console.log('📊 Event data keys:', Object.keys(stripeData));

  if (!stripeData) {
    console.log('❌ No stripe data in event');
    return;
  }

  if (!('customer' in stripeData)) {
    console.log('❌ No customer field in stripe data');
    return;
  }

  // for one time payments, we only listen for the checkout.session.completed event
  if (event.type === 'payment_intent.succeeded' && event.data.object.invoice === null) {
    console.log('⚠️ Ignoring payment_intent.succeeded for one-time payment');
    return;
  }

  const { customer: customerId } = stripeData;
  console.log('👤 Customer ID:', customerId);

  if (!customerId || typeof customerId !== 'string') {
    console.error(`❌ Invalid customer ID: ${customerId}`);
  } else {
    let isSubscription = true;

    if (event.type === 'checkout.session.completed') {
      const { mode } = stripeData as Stripe.Checkout.Session;
      console.log('🛒 Checkout mode:', mode);

      isSubscription = mode === 'subscription';
      console.log(`🎯 Processing ${isSubscription ? 'subscription' : 'one-time payment'} checkout session`);
    }

    const { mode, payment_status } = stripeData as Stripe.Checkout.Session;
    console.log('💰 Payment status:', payment_status);

    if (isSubscription) {
      console.log(`🔄 Starting subscription sync for customer: ${customerId}`);
      await syncCustomerFromStripe(customerId);
    } else if (mode === 'payment' && payment_status === 'paid') {
      console.log('💳 Processing paid one-time payment...');
      try {
        // Extract the necessary information from the session
        const {
          id: checkout_session_id,
          payment_intent,
          amount_subtotal,
          amount_total,
          currency,
          metadata,
          client_reference_id,
        } = stripeData as Stripe.Checkout.Session;

        const paymentIntentId =
          typeof payment_intent === 'string'
            ? payment_intent
            : payment_intent && typeof payment_intent === 'object' && 'id' in payment_intent
              ? (payment_intent as { id: string }).id
              : null;
        const metadataJson = metadata
          ? Object.fromEntries(Object.entries(metadata))
          : {};
        const assessmentId = (metadataJson as Record<string, string | undefined>)?.assessment_id ?? client_reference_id ?? null;
        const advisorEmail = (metadataJson as Record<string, string | undefined>)?.advisor_email ?? null;

        console.log('🔍 Payment details:', {
          checkout_session_id, assessmentId, advisorEmail, amount_total, currency
        });

        if (!paymentIntentId) {
          console.error('❌ Checkout session missing payment intent id', checkout_session_id);
          return;
        }

        // Insert the order into the stripe_orders table
        console.log('💾 Inserting order into stripe_orders...');
        const { data: orderData, error: orderError } = await supabase
          .from('stripe_orders')
          .upsert(
            {
              checkout_session_id,
              payment_intent_id: paymentIntentId,
              customer_id: customerId,
              amount_subtotal,
              amount_total,
              currency,
              payment_status,
              status: 'completed',
              assessment_id: assessmentId,
              advisor_email: advisorEmail,
              metadata: metadataJson,
            },
            { onConflict: 'checkout_session_id' },
          )
          .select()
          .maybeSingle();

        if (orderError) {
          console.error('❌ Error upserting order:', orderError);
          return;
        }
        console.log('✅ Order inserted successfully:', orderData?.id);

        const stripeOrderId = orderData?.id ?? null;

        if (!assessmentId) {
          console.warn('⚠️ Checkout session completed without assessment metadata', {
            checkout_session_id,
          });
        } else {
          const now = new Date().toISOString();
          console.log('🔓 Unlocking assessment:', assessmentId);

          // Update advisor_assessments table
          console.log('📝 Updating advisor_assessments table...');
          const { error: updateAssessmentError } = await supabase
            .from('advisor_assessments')
            .update({
              is_paid: true,
              paid_at: now,
              last_checkout_session_id: checkout_session_id,
            })
            .eq('id', assessmentId);

          if (updateAssessmentError) {
            console.error('❌ Failed to mark assessment as paid:', updateAssessmentError);
          } else {
            console.log('✅ Assessment marked as paid');
          }

          // Update assessment_results table
          console.log('📝 Updating assessment_results table...');
          const { error: updateResultError } = await supabase
            .from('assessment_results')
            .update({
              is_unlocked: true,
              unlocked_at: now,
              checkout_session_id,
              ...(stripeOrderId ? { stripe_order_id: stripeOrderId } : {}),
            })
            .eq('assessment_id', assessmentId);

          if (updateResultError) {
            console.error('❌ Failed to unlock assessment result:', updateResultError);
          } else {
            console.log('✅ Assessment result unlocked');
          }
        }
        console.log(`🎉 Successfully processed one-time payment for session: ${checkout_session_id}`);
      } catch (error) {
        console.error('💥 Error processing one-time payment:', error);
      }
    }
  }
}

// based on the excellent https://github.com/t3dotgg/stripe-recommendations
async function syncCustomerFromStripe(customerId: string) {
  try {
    // fetch latest subscription data from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    // TODO verify if needed
    if (subscriptions.data.length === 0) {
      console.info(`No active subscriptions found for customer: ${customerId}`);
      const { error: noSubError } = await supabase.from('stripe_subscriptions').upsert(
        {
          customer_id: customerId,
          status: 'not_started',
        },
        {
          onConflict: 'customer_id',
        },
      );

      if (noSubError) {
        console.error('Error updating subscription status:', noSubError);
        throw new Error('Failed to update subscription status in database');
      }
    }

    // assumes that a customer can only have a single subscription
    const subscription = subscriptions.data[0];

    // store subscription state
    const { error: subError } = await supabase.from('stripe_subscriptions').upsert(
      {
        customer_id: customerId,
        subscription_id: subscription.id,
        price_id: subscription.items.data[0].price.id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        ...(subscription.default_payment_method && typeof subscription.default_payment_method !== 'string'
          ? {
              payment_method_brand: subscription.default_payment_method.card?.brand ?? null,
              payment_method_last4: subscription.default_payment_method.card?.last4 ?? null,
            }
          : {}),
        status: subscription.status,
      },
      {
        onConflict: 'customer_id',
      },
    );

    if (subError) {
      console.error('Error syncing subscription:', subError);
      throw new Error('Failed to sync subscription in database');
    }
    console.info(`Successfully synced subscription for customer: ${customerId}`);
  } catch (error) {
    console.error(`Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}