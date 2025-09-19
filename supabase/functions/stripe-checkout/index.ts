import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, x-client-info, apikey',
  };

  // For 204 No Content, don't include Content-Type or body
  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req) => {
  // Always handle OPTIONS first, before any other processing
  if (req.method === 'OPTIONS') {
    return corsResponse(null, 204);
  }

  try {
    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    // Check required environment variables
    const supabaseUrl = Deno.env.get('PROJECT_URL');
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY');
    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');

    if (!supabaseUrl) {
      console.error('Missing PROJECT_URL environment variable');
      return corsResponse({ error: 'Server configuration error' }, 500);
    }

    if (!supabaseServiceKey) {
      console.error('Missing SERVICE_ROLE_KEY environment variable');
      return corsResponse({ error: 'Server configuration error' }, 500);
    }

    if (!stripeSecret) {
      console.error('Missing STRIPE_SECRET_KEY environment variable');
      return corsResponse({ error: 'Server configuration error' }, 500);
    }

    // Initialize clients after environment validation
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeSecret, {
      appInfo: {
        name: 'Money Personality Assessment',
        version: '1.0.0',
      },
    });

    const reportPriceId = Deno.env.get('STRIPE_REPORT_PRICE_ID') ?? 'price_1S8R4kLG78umdkDnPPtdrLhQ';

    const {
      price_id,
      success_url,
      cancel_url,
      mode = 'payment',
      assessment_id,
    } = await req.json();

    const error = validateParameters(
      { success_url, cancel_url, mode, assessment_id },
      {
        cancel_url: 'string',
        success_url: 'string',
        assessment_id: 'string',
        mode: { values: ['payment'] },
      },
    );

    if (error) {
      return corsResponse({ error }, 400);
    }

    if (price_id != null && typeof price_id !== 'string') {
      return corsResponse({ error: 'Expected parameter price_id to be a string' }, 400);
    }

    const priceIdToUse = price_id ?? reportPriceId;

    if (!priceIdToUse) {
      return corsResponse({ error: 'Missing Stripe price id' }, 400);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return corsResponse({ error: 'Authorization header required' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser(token);

    if (getUserError) {
      console.error('Auth error:', getUserError);
      return corsResponse({ error: 'Failed to authenticate user' }, 401);
    }

    if (!user) {
      return corsResponse({ error: 'User not found' }, 404);
    }

    const { data: customer, error: getCustomerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (getCustomerError) {
      console.error('Failed to fetch customer information from the database', getCustomerError);
      return corsResponse({ error: 'Failed to fetch customer information' }, 500);
    }

    let customerId;

    /**
     * In case we don't have a mapping yet, the customer does not exist and we need to create one.
     */
    if (!customer || !customer.customer_id) {
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });

      console.log(`Created new Stripe customer ${newCustomer.id} for user ${user.id}`);

      const { error: createCustomerError } = await supabase.from('stripe_customers').insert({
        user_id: user.id,
        customer_id: newCustomer.id,
      });

      if (createCustomerError) {
        console.error('Failed to save customer information in the database', createCustomerError);

        // Try to clean up the Stripe customer
        try {
          await stripe.customers.del(newCustomer.id);
        } catch (deleteError) {
          console.error('Failed to clean up after customer mapping error:', deleteError);
        }

        return corsResponse({ error: 'Failed to create customer mapping' }, 500);
      }

      customerId = newCustomer.id;
      console.log(`Successfully set up new customer ${customerId}`);
    } else {
      customerId = customer.customer_id;
    }

    // Validate assessment exists and belongs to user
    const { data: assessment, error: getAssessmentError } = await supabase
      .from('advisor_assessments')
      .select('id, advisor_email, status, is_paid, last_checkout_session_id')
      .eq('id', assessment_id)
      .maybeSingle();

    if (getAssessmentError) {
      console.error('Failed to fetch assessment before checkout', getAssessmentError);
      return corsResponse({ error: 'Failed to validate assessment' }, 500);
    }

    if (!assessment) {
      return corsResponse({ error: 'Assessment not found' }, 404);
    }

    if (assessment.advisor_email !== user.email) {
      return corsResponse({ error: 'You do not have access to this assessment' }, 403);
    }

    if (assessment.status !== 'completed') {
      return corsResponse({ error: 'Assessment is not completed yet' }, 400);
    }

    if (assessment.is_paid) {
      return corsResponse({ error: 'Assessment is already unlocked' }, 400);
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceIdToUse,
          quantity: 1,
        },
      ],
      mode,
      client_reference_id: assessment_id,
      metadata: {
        assessment_id,
        advisor_email: user.email ?? '',
      },
      payment_intent_data: {
        metadata: {
          assessment_id,
          advisor_email: user.email ?? '',
        },
      },
      success_url,
      cancel_url,
    });

    console.log(`Created checkout session ${session.id} for customer ${customerId}`);

    // Store checkout session on assessment
    const { error: updateAssessmentError } = await supabase
      .from('advisor_assessments')
      .update({ last_checkout_session_id: session.id })
      .eq('id', assessment_id);

    if (updateAssessmentError) {
      console.error('Failed to store checkout session on assessment', updateAssessmentError);
    }

    return corsResponse({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error(`Checkout error: ${error.message}`);
    console.error('Error stack:', error.stack);
    return corsResponse({ error: 'Internal server error' }, 500);
  }
});

type ExpectedType = 'string' | { values: string[] };
type Expectations<T> = { [K in keyof T]: ExpectedType };

function validateParameters<T extends Record<string, any>>(values: T, expected: Expectations<T>): string | undefined {
  for (const parameter in values) {
    const expectation = expected[parameter];
    const value = values[parameter];

    if (expectation === 'string') {
      if (value == null) {
        return `Missing required parameter ${parameter}`;
      }
      if (typeof value !== 'string') {
        return `Expected parameter ${parameter} to be a string got ${JSON.stringify(value)}`;
      }
    } else {
      if (!expectation.values.includes(value)) {
        return `Expected parameter ${parameter} to be one of ${expectation.values.join(', ')}`;
      }
    }
  }

  return undefined;
}