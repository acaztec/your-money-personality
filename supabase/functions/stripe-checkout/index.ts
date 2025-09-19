// Complete Stripe Checkout Edge Function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  console.log(`${req.method} ${req.url}`);
  
  // Handle CORS preflight - this must be first
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('Starting Stripe checkout process...');

    // Dynamic imports to prevent startup issues
    const [{ default: Stripe }, { createClient }] = await Promise.all([
      import('npm:stripe@17.7.0'),
      import('npm:@supabase/supabase-js@2.49.1')
    ]);

    console.log('Dependencies imported successfully');

    // Get environment variables
    const projectUrl = Deno.env.get('PROJECT_URL');
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY');  
    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
    const reportPriceId = Deno.env.get('STRIPE_REPORT_PRICE_ID');

    console.log('Environment check:', {
      hasProjectUrl: !!projectUrl,
      hasServiceKey: !!serviceRoleKey,
      hasStripeSecret: !!stripeSecret,
      hasReportPrice: !!reportPriceId
    });

    // Validate required environment variables
    if (!projectUrl || !serviceRoleKey || !stripeSecret || !reportPriceId) {
      const missing = [];
      if (!projectUrl) missing.push('PROJECT_URL');
      if (!serviceRoleKey) missing.push('SERVICE_ROLE_KEY');
      if (!stripeSecret) missing.push('STRIPE_SECRET_KEY');
      if (!reportPriceId) missing.push('STRIPE_REPORT_PRICE_ID');
      
      console.error('Missing environment variables:', missing);
      return new Response(JSON.stringify({ 
        error: 'Server configuration error - missing environment variables', 
        missing 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log('Request body parsed:', body);
    } catch (e) {
      console.error('JSON parse error:', e);
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { assessment_id, success_url, cancel_url, price_id } = body;

    // Validate required parameters
    if (!assessment_id || !success_url || !cancel_url) {
      console.error('Missing required parameters:', { assessment_id: !!assessment_id, success_url: !!success_url, cancel_url: !!cancel_url });
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters',
        required: ['assessment_id', 'success_url', 'cancel_url']
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase client
    const supabase = createClient(projectUrl, serviceRoleKey);
    console.log('Supabase client initialized');

    // Get user from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('No authorization header found');
      return new Response(JSON.stringify({ error: 'Authorization header required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user?.email) {
      console.error('User authentication failed:', userError);
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('User authenticated:', user.email);

    // Verify assessment exists and belongs to this advisor
    const { data: assessment, error: assessmentError } = await supabase
      .from('advisor_assessments')
      .select('*')
      .eq('id', assessment_id)
      .eq('advisor_email', user.email)
      .single();

    if (assessmentError || !assessment) {
      console.error('Assessment not found or unauthorized:', assessmentError);
      return new Response(JSON.stringify({ error: 'Assessment not found or access denied' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Assessment verified:', assessment.id);

    // Initialize Stripe
    const stripe = new Stripe(stripeSecret, {
      apiVersion: '2023-10-16'
    });
    console.log('Stripe client initialized');

    // Use the price_id from the request or fall back to environment variable
    const finalPriceId = price_id || reportPriceId;
    console.log('Using price ID:', finalPriceId);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: success_url,
      cancel_url: cancel_url,
      client_reference_id: assessment_id,
      metadata: {
        assessment_id: assessment_id,
        advisor_email: user.email,
      },
    });

    console.log('Stripe checkout session created:', session.id);

    if (!session.url) {
      console.error('Stripe session created but no URL returned');
      return new Response(JSON.stringify({ error: 'Checkout session created but no URL available' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Return the checkout URL
    return new Response(JSON.stringify({
      url: session.url,
      sessionId: session.id
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create checkout session',
      message: error.message || 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});