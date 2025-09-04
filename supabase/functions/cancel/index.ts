// Cancel Registration Edge Function
import { createServiceClient } from "../_shared/supabase.ts";
import { 
  createResponse, 
  createErrorResponse, 
  validateRequired, 
  rateLimitCheck,
  getClientIP 
} from "../_shared/utils.ts";

interface CancelRegistrationRequest {
  registrationId: string;
  reason?: string;
  actorId?: string;
}

export default async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
      }
    });
  }

  if (req.method !== "POST") {
    return createErrorResponse("Method not allowed", 405);
  }

  try {
    const supabase = createServiceClient();
    const clientIP = getClientIP(req);
    
    // Parse request body
    let body: CancelRegistrationRequest;
    try {
      body = await req.json();
    } catch {
      return createErrorResponse("Invalid JSON body", 400);
    }

    // Validate required fields
    const validationError = validateRequired(body, ['registrationId']);
    if (validationError) {
      return createErrorResponse(validationError, 400);
    }

    // Rate limiting: 10 cancellation attempts per minute per IP
    const rateLimitKey = `cancel:${clientIP}`;
    const rateLimitOk = await rateLimitCheck(supabase, rateLimitKey, 1, 10);
    if (!rateLimitOk) {
      return createErrorResponse("Too many cancellation attempts. Please try again later.", 429);
    }

    // Validate registration exists and get details
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select(`
        id, 
        event_id, 
        profile_id, 
        organization_id, 
        status,
        booked_at,
        class_events!inner(
          id,
          title,
          start_at,
          price_cents,
          organization_id
        )
      `)
      .eq('id', body.registrationId)
      .single();

    if (regError || !registration) {
      return createErrorResponse("Registration not found", 404);
    }

    if (registration.status !== 'confirmed') {
      return createErrorResponse(`Registration cannot be cancelled (current status: ${registration.status})`, 400);
    }

    // Check cancellation policy (e.g., must cancel at least 2 hours before)
    const eventStart = new Date(registration.class_events.start_at);
    const now = new Date();
    const hoursUntilEvent = (eventStart.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilEvent < 2) {
      return createErrorResponse("Cannot cancel less than 2 hours before event start", 400);
    }

    // Attempt cancellation via RPC
    const { data: success, error: cancelError } = await supabase.rpc('cancel_registration', {
      p_registration_id: body.registrationId,
      p_reason: body.reason || 'User requested cancellation',
      p_actor_id: body.actorId
    });

    if (cancelError) {
      console.error('Cancellation error:', cancelError);
      return createErrorResponse(cancelError.message || "Cancellation failed", 400);
    }

    // Process refund if applicable
    let refundResult = null;
    if (registration.class_events.price_cents > 0) {
      try {
        refundResult = await processRefund(supabase, registration);
      } catch (refundError) {
        console.error('Refund processing failed:', refundError);
        // Don't fail the cancellation if refund fails - handle async
        refundResult = { status: 'pending', message: 'Refund will be processed separately' };
      }
    }

    return createResponse({
      registrationId: body.registrationId,
      eventId: registration.event_id,
      customerId: registration.profile_id,
      status: 'cancelled',
      refund: refundResult,
      cancelledAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cancellation function error:', error);
    return createErrorResponse("Internal server error", 500);
  }
}

async function processRefund(supabase: any, registration: any) {
  // Find the original payment
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('*')
    .eq('organization_id', registration.organization_id)
    .contains('metadata', { registrationId: registration.id })
    .eq('status', 'paid')
    .single();

  if (paymentError || !payment) {
    throw new Error('Original payment not found');
  }

  switch (payment.payment_method) {
    case 'wallet':
      return await processWalletRefund(supabase, payment, registration);
    
    case 'card':
      return await processStripeRefund(supabase, payment, registration);
    
    case 'invoice':
      return await processInvoiceRefund(supabase, payment, registration);
    
    default:
      throw new Error(`Refund not supported for payment method: ${payment.payment_method}`);
  }
}

async function processWalletRefund(supabase: any, payment: any, registration: any) {
  // Credit back to wallet
  const { data, error } = await supabase.rpc('credit_to_wallet', {
    p_customer_id: registration.profile_id,
    p_organization_id: registration.organization_id,
    p_amount_cents: payment.amount_cents,
    p_description: `Refund for cancelled class: ${registration.class_events.title}`,
    p_reference_type: 'refund',
    p_reference_id: registration.id
  });

  if (error) {
    throw new Error(error.message || 'Wallet refund failed');
  }

  return { method: 'wallet', status: 'completed', amount: payment.amount_cents };
}

async function processStripeRefund(supabase: any, payment: any, registration: any) {
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    throw new Error("Stripe not configured");
  }

  // Create Stripe refund
  const stripeResponse = await fetch("https://api.stripe.com/v1/refunds", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      payment_intent: payment.stripe_payment_intent_id,
      amount: payment.amount_cents.toString(),
      metadata: JSON.stringify({
        registrationId: registration.id,
        reason: 'Class cancellation'
      })
    })
  });

  if (!stripeResponse.ok) {
    const error = await stripeResponse.json();
    throw new Error(`Stripe refund failed: ${error.error?.message || 'Unknown error'}`);
  }

  const refund = await stripeResponse.json();

  // Update payment record
  await supabase.from('payments').insert({
    organization_id: payment.organization_id,
    customer_id: payment.customer_id,
    amount_cents: -payment.amount_cents,
    currency: payment.currency,
    payment_method: payment.payment_method,
    status: 'refunded',
    stripe_payment_intent_id: refund.id,
    metadata: { 
      originalPaymentId: payment.id,
      registrationId: registration.id,
      refundId: refund.id
    }
  });

  return {
    method: 'stripe',
    status: 'completed',
    amount: payment.amount_cents,
    refundId: refund.id
  };
}

async function processInvoiceRefund(supabase: any, payment: any, registration: any) {
  // Mark invoice as cancelled and create credit note
  await supabase
    .from('invoices')
    .update({ status: 'cancelled' })
    .eq('id', payment.metadata.invoiceId);

  return {
    method: 'invoice',
    status: 'completed',
    amount: payment.amount_cents,
    note: 'Invoice cancelled, no payment required'
  };
}
