// Minimal, bulletproof Edge Function that prioritizes CORS handling
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  console.log(`${req.method} ${req.url}`);
  
  // CRITICAL: Handle OPTIONS first - no exceptions, no imports, no logic
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  // Only proceed if method is POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('Starting checkout session creation...');

    // Dynamic imports to prevent startup crashes
    const [{ default: Stripe }, { createClient }] = await Promise.all([
      import('npm:stripe@17.7.0'),
      import('npm:@supabase/supabase-js@2.49.1')
    ]);

    console.log('Imported dependencies successfully');

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

    // Check critical env vars
    if (!projectUrl || !serviceRoleKey || !stripeSecret) {
      const missing = [];
      if (!projectUrl) missing.push('PROJECT_URL');
      if (!serviceRoleKey) missing.push('SERVICE_ROLE_KEY');
      if (!stripeSecret) missing.push('STRIPE_SECRET_KEY');
      
      console.error('Missing environment variables:', missing);
      return new Response(JSON.stringify({ 
        error: 'Missing required environment variables', 
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
    } catch (e) {
      console.error('JSON parse error:', e);
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Request body:', body);

    const { assessment_id, success_url, cancel_url, price_id } = body;

    // Validate required parameters
    if (!assessment_id || !success_url || !cancel_url) {
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters',
        required: ['assessment_id', 'success_url', 'cancel_url']
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize clients
    const supabase = createClient(projectUrl, serviceRoleKey);
    const stripe = new Stripe(stripeSecret, {
      apiVersion: '2023-10-16'
    });

    console.log('Initialized Stripe and Supabase clients');

    // Get user from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user?.email) {
      console.error('User auth error:', userError);
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Authenticated user:', user.email);

    // For now, return a test response to verify the function works
    return new Response(JSON.stringify({
      message: 'Edge Function is working!',
      user: user.email,
      assessment_id,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message || 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});