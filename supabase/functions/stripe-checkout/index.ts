import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, x-client-info, apikey',
};

// Handle CORS preflight immediately - before any other code can fail
Deno.serve(async (req) => {
  // CRITICAL: Handle OPTIONS first, before ANY other processing
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    // Only import and initialize if we get past OPTIONS
    const [
      { default: Stripe },
      { createClient }
    ] = await Promise.all([
      import('npm:stripe@17.7.0'),
      import('npm:@supabase/supabase-js@2.49.1')
    ]);

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get environment variables with fallbacks
    const projectUrl = Deno.env.get('PROJECT_URL');
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY');
    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
    const reportPriceId = Deno.env.get('STRIPE_REPORT_PRICE_ID') || 'price_1S8R4kLG78umdkDnPPtdrLhQ';

    // Validate environment variables
    if (!projectUrl) {
      console.error('Missing PROJECT_URL environment variable');
      return new Response(JSON.stringify({ error: 'Server configuration error: PROJECT_URL missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!serviceRoleKey) {
      console.error('Missing SERVICE_ROLE_KEY environment variable');
      return new Response(JSON.stringify({ error: 'Server configuration error: SERVICE_ROLE_KEY missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!stripeSecret) {
      console.error('Missing STRIPE_SECRET_KEY environment variable');
      return new Response(JSON.stringify({ error: 'Server configuration error: STRIPE_SECRET_KEY missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize clients after validation
    const supabase = createClient(projectUrl, serviceRoleKey);
    const stripe = new Stripe(stripeSecret, {
      appInfo: {
        name: 'Money Personality Assessment',
        version: '1.0.0',
      },
    });

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const {
      price_id,
      success_url,
      cancel_url,
      mode = 'payment',
      assessment_id,
    } = requestBody;

    // Validate required parameters
    if (!success_url || typeof success_url !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid success_url' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!cancel_url || typeof cancel_url !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid cancel_url' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!assessment_id || typeof assessment_id !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid assessment_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (mode !== 'payment') {
      return new Response(JSON.stringify({ error: 'Only payment mode is supported' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const priceIdToUse = price_id || reportPriceId;

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: getUserError } = await supabase.auth.getUser(token);

    if (getUserError) {
      console.error('Auth error:', getUserError);
      return new Response(JSON.stringify({ error: 'Failed to authenticate user' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!user || !user.email) {
      return new Response(JSON.stringify({ error: 'User not found or missing email' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get or create Stripe customer
    let customerId: string;
    const { data: customer, error: getCustomerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (getCustomerError) {
      console.error('Failed to fetch customer information:', getCustomerError);
      return new Response(JSON.stringify({ error: 'Failed to fetch customer information' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!customer?.customer_id) {
      // Create new Stripe customer
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });

      console.log(`Created new Stripe customer ${newCustomer.id} for user ${user.id}`);

      const { error: createCustomerError } = await supabase
        .from('stripe_customers')
        .insert({
          user_id: user.id,
          customer_id: newCustomer.id,
        });

      if (createCustomerError) {
        console.error('Failed to save customer information:', createCustomerError);
        // Try to clean up Stripe customer
        try {
          await stripe.customers.del(newCustomer.id);
        } catch (deleteError) {
          console.error('Failed to clean up Stripe customer:', deleteError);
        }
        return new Response(JSON.stringify({ error: 'Failed to create customer mapping' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      customerId = newCustomer.id;
    } else {
      customerId = customer.customer_id;
    }

    // Validate assessment
    const { data: assessment, error: getAssessmentError } = await supabase
      .from('advisor_assessments')
      .select('id, advisor_email, status, is_paid')
      .eq('id', assessment_id)
      .maybeSingle();

    if (getAssessmentError) {
      console.error('Failed to fetch assessment:', getAssessmentError);
      return new Response(JSON.stringify({ error: 'Failed to validate assessment' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!assessment) {
      return new Response(JSON.stringify({ error: 'Assessment not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (assessment.advisor_email !== user.email) {
      return new Response(JSON.stringify({ error: 'You do not have access to this assessment' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (assessment.status !== 'completed') {
      return new Response(JSON.stringify({ error: 'Assessment is not completed yet' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (assessment.is_paid) {
      return new Response(JSON.stringify({ error: 'Assessment is already unlocked' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceIdToUse,
        quantity: 1,
      }],
      mode,
      client_reference_id: assessment_id,
      metadata: {
        assessment_id,
        advisor_email: user.email,
      },
      payment_intent_data: {
        metadata: {
          assessment_id,
          advisor_email: user.email,
        },
      },
      success_url,
      cancel_url,
    });

    console.log(`Created checkout session ${session.id} for customer ${customerId}`);

    // Update assessment with checkout session
    const { error: updateAssessmentError } = await supabase
      .from('advisor_assessments')
      .update({ last_checkout_session_id: session.id })
      .eq('id', assessment_id);

    if (updateAssessmentError) {
      console.error('Failed to store checkout session on assessment:', updateAssessmentError);
    }

    return new Response(JSON.stringify({ 
      sessionId: session.id, 
      url: session.url 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Checkout error:', error?.message || error);
    console.error('Error stack:', error?.stack);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error?.message || 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});