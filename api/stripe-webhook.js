import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Helper to create Supabase admin client (server-side only)
function createSupabaseAdmin() {
  return {
    from: (table) => ({
      update: async (data) => ({
        eq: async (column, value) => {
          const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${value}`, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify(data)
          });

          if (!response.ok) {
            const error = await response.text();
            throw new Error(`Supabase update failed: ${error}`);
          }

          return { error: null };
        }
      }),
      insert: async (data) => {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Supabase insert failed: ${error}`);
        }

        return { error: null };
      }
    })
  };
}

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let event;

  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      console.error('No stripe-signature header');
      res.status(400).json({ error: 'No stripe-signature header' });
      return;
    }

    if (!STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      res.status(500).json({ error: 'Webhook secret not configured' });
      return;
    }

    event = stripe.webhooks.constructEvent(buf, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).json({ error: `Webhook Error: ${err.message}` });
    return;
  }

  console.log('Received event:', event.type);

  const supabase = createSupabaseAdmin();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);

        const assessmentId = session.metadata?.assessment_id;
        const advisorEmail = session.metadata?.advisor_email;

        if (!assessmentId || !advisorEmail) {
          console.error('Missing metadata in checkout session:', session.metadata);
          res.status(400).json({ error: 'Missing metadata' });
          return;
        }

        const now = new Date().toISOString();

        // Create or update stripe_orders record
        const orderData = {
          stripe_checkout_session_id: session.id,
          stripe_customer_id: session.customer || 'guest',
          email: advisorEmail,
          amount: session.amount_total || 0,
          currency: session.currency || 'usd',
          status: 'completed',
          stripe_payment_intent_id: session.payment_intent,
          metadata: session.metadata || {},
          updated_at: now
        };

        await supabase.from('stripe_orders').insert(orderData);

        // Unlock the assessment result
        await supabase
          .from('assessment_results')
          .update({
            is_unlocked: true,
            unlocked_at: now,
            checkout_session_id: session.id
          })
          .eq('assessment_id', assessmentId);

        // Mark the advisor assessment as paid
        await supabase
          .from('advisor_assessments')
          .update({
            is_paid: true,
            paid_at: now,
            last_checkout_session_id: session.id
          })
          .eq('id', assessmentId);

        console.log('Successfully unlocked assessment:', assessmentId);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object;
        console.log('Checkout session expired:', session.id);

        // Update order status to expired if it exists
        await supabase
          .from('stripe_orders')
          .update({ status: 'expired', updated_at: new Date().toISOString() })
          .eq('stripe_checkout_session_id', session.id);

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log('Payment failed:', paymentIntent.id);

        // Update order status to failed
        await supabase
          .from('stripe_orders')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}
