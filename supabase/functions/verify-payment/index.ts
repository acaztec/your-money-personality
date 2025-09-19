const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    // Get Stripe and Supabase
    const [{ default: Stripe }, { createClient }] = await Promise.all([
      import('npm:stripe@17.7.0'),
      import('npm:@supabase/supabase-js@2.49.1')
    ]);

    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
    const projectUrl = Deno.env.get('PROJECT_URL');
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY');

    if (!stripeSecret || !projectUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse request
    const { sessionId, assessmentId } = await req.json();

    if (!sessionId || !assessmentId) {
      return new Response(JSON.stringify({ error: 'Missing sessionId or assessmentId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize clients
    const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' });
    const supabase = createClient(projectUrl, serviceRoleKey);

    // Verify payment with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid' || session.mode !== 'payment') {
      return new Response(JSON.stringify({ error: 'Payment not completed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify assessment ID matches
    const sessionAssessmentId = session.metadata?.assessment_id || session.client_reference_id;
    if (sessionAssessmentId !== assessmentId) {
      return new Response(JSON.stringify({ error: 'Assessment ID mismatch' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const now = new Date().toISOString();

    // Update database - unlock the assessment
    const [assessmentResult, resultResult] = await Promise.all([
      supabase
        .from('advisor_assessments')
        .update({
          is_paid: true,
          paid_at: now,
          last_checkout_session_id: sessionId,
        })
        .eq('id', assessmentId),

      supabase
        .from('assessment_results')
        .update({
          is_unlocked: true,
          unlocked_at: now,
          checkout_session_id: sessionId,
        })
        .eq('assessment_id', assessmentId)
    ]);

    if (assessmentResult.error || resultResult.error) {
      console.error('Database update error:', { assessmentResult, resultResult });
      return new Response(JSON.stringify({ error: 'Failed to unlock assessment' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, unlocked: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return new Response(JSON.stringify({ error: 'Payment verification failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});