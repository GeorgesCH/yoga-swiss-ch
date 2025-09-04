// Book Event Edge Function
import { createServiceClient } from "../_shared/supabase.ts";
import { 
  createResponse, 
  createErrorResponse, 
  validateRequired, 
  getIdempotencyKey,
  rateLimitCheck,
  getClientIP 
} from "../_shared/utils.ts";

interface BookEventRequest {
  eventId: string;
  customerId: string;
  paymentMethod?: 'stripe' | 'twint' | 'wallet' | 'invoice';
  paymentData?: any;
}

export default async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, idempotency-key"
      }
    });
  }

  if (req.method !== "POST") {
    return createErrorResponse("Method not allowed", 405);
  }

  try {
    const supabase = createServiceClient();
    const idempotencyKey = getIdempotencyKey(req);
    const clientIP = getClientIP(req);
    
    // Parse request body
    let body: BookEventRequest;
    try {
      body = await req.json();
    } catch {
      return createErrorResponse("Invalid JSON body", 400);
    }

    // Validate required fields
    const validationError = validateRequired(body, ['eventId', 'customerId']);
    if (validationError) {
      return createErrorResponse(validationError, 400);
    }

    // Rate limiting: 5 booking attempts per minute per IP
    const rateLimitKey = `book:${clientIP}`;
    const rateLimitOk = await rateLimitCheck(supabase, rateLimitKey, 1, 5);
    if (!rateLimitOk) {
      return createErrorResponse("Too many booking attempts. Please try again later.", 429);
    }

    // Additional rate limiting per user
    const userRateLimitKey = `book:user:${body.customerId}`;
    const userRateLimitOk = await rateLimitCheck(supabase, userRateLimitKey, 1, 3);
    if (!userRateLimitOk) {
      return createErrorResponse("Too many booking attempts for this user. Please try again later.", 429);
    }

    // Validate event exists and is bookable
    const { data: event, error: eventError } = await supabase
      .from('class_events')
      .select('id, organization_id, title, start_at, capacity, reg_count, price_cents, status')
      .eq('id', body.eventId)
      .single();

    if (eventError || !event) {
      return createErrorResponse("Event not found", 404);
    }

    if (event.status !== 'scheduled') {
      return createErrorResponse("Event is not available for booking", 400);
    }

    if (event.capacity && event.reg_count >= event.capacity) {
      return createErrorResponse("Event is full", 400);
    }

    // Check if user is already registered
    const { data: existingReg } = await supabase
      .from('registrations')
      .select('id')
      .eq('event_id', body.eventId)
      .eq('profile_id', body.customerId)
      .single();

    if (existingReg) {
      return createErrorResponse("User already registered for this event", 400);
    }

    // Attempt booking via RPC
    const { data: registrationId, error: bookingError } = await supabase.rpc('book_event', {
      p_event_id: body.eventId,
      p_profile_id: body.customerId,
      p_idem: idempotencyKey
    });

    if (bookingError) {
      console.error('Booking error:', bookingError);
      return createErrorResponse(bookingError.message || "Booking failed", 400);
    }

    // Handle payment if required
    let paymentResult = null;
    if (body.paymentMethod && event.price_cents > 0) {
      try {
        paymentResult = await processPayment(
          supabase,
          registrationId,
          event,
          body.paymentMethod,
          body.paymentData
        );
      } catch (paymentError) {
        // If payment fails, we should cancel the registration
        await supabase.rpc('cancel_registration', {
          p_registration_id: registrationId,
          p_reason: 'Payment failed',
          p_actor_id: body.customerId
        });
        
        return createErrorResponse(
          `Booking created but payment failed: ${paymentError.message}`, 
          402
        );
      }
    }

    // Return success response
    return createResponse({
      registrationId,
      eventId: body.eventId,
      customerId: body.customerId,
      payment: paymentResult,
      idempotencyKey
    }, 201, {
      "Idempotency-Key": idempotencyKey
    });

  } catch (error) {
    console.error('Booking function error:', error);
    return createErrorResponse("Internal server error", 500);
  }
}

async function processPayment(
  supabase: any,
  registrationId: string,
  event: any,
  paymentMethod: string,
  paymentData: any
) {
  switch (paymentMethod) {
    case 'wallet':
      return await processWalletPayment(supabase, registrationId, event);
    
    case 'stripe':
      return await processStripePayment(supabase, registrationId, event, paymentData);
    
    case 'twint':
      return await processTwintPayment(supabase, registrationId, event, paymentData);
    
    case 'invoice':
      return await processInvoicePayment(supabase, registrationId, event);
    
    default:
      throw new Error(`Unsupported payment method: ${paymentMethod}`);
  }
}

async function processWalletPayment(supabase: any, registrationId: string, event: any) {
  // Check wallet balance and deduct
  const { data, error } = await supabase.rpc('deduct_from_wallet', {
    p_customer_id: event.customerId,
    p_organization_id: event.organization_id,
    p_amount_cents: event.price_cents,
    p_description: `Class booking: ${event.title}`,
    p_reference_type: 'registration',
    p_reference_id: registrationId
  });

  if (error) {
    throw new Error(error.message || 'Wallet payment failed');
  }

  return { method: 'wallet', status: 'completed', transactionId: data };
}

async function processStripePayment(supabase: any, registrationId: string, event: any, paymentData: any) {
  // Create Stripe PaymentIntent
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    throw new Error("Stripe not configured");
  }

  const stripeResponse = await fetch("https://api.stripe.com/v1/payment_intents", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      amount: event.price_cents.toString(),
      currency: "chf",
      metadata: JSON.stringify({
        registrationId,
        eventId: event.id,
        organizationId: event.organization_id
      })
    })
  });

  if (!stripeResponse.ok) {
    throw new Error("Failed to create Stripe PaymentIntent");
  }

  const paymentIntent = await stripeResponse.json();

  // Store payment record
  await supabase.from('payments').insert({
    organization_id: event.organization_id,
    customer_id: event.customerId,
    amount_cents: event.price_cents,
    currency: 'CHF',
    payment_method: 'card',
    status: 'pending',
    stripe_payment_intent_id: paymentIntent.id,
    metadata: { registrationId, eventId: event.id }
  });

  return {
    method: 'stripe',
    status: 'pending',
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id
  };
}

async function processTwintPayment(supabase: any, registrationId: string, event: any, paymentData: any) {
  // TWINT integration would go here
  // This is a placeholder for Swiss TWINT payment processing
  throw new Error("TWINT payment not yet implemented");
}

async function processInvoicePayment(supabase: any, registrationId: string, event: any) {
  // Create invoice for later payment
  const invoiceNumber = `INV-${Date.now()}-${registrationId.slice(-8)}`;
  
  const { data, error } = await supabase.from('invoices').insert({
    organization_id: event.organization_id,
    customer_id: event.customerId,
    invoice_number: invoiceNumber,
    subtotal_cents: event.price_cents,
    tax_cents: Math.round(event.price_cents * 0.077), // Swiss VAT
    total_cents: event.price_cents + Math.round(event.price_cents * 0.077),
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days
    status: 'sent',
    metadata: { registrationId, eventId: event.id }
  }).select().single();

  if (error) {
    throw new Error('Failed to create invoice');
  }

  return {
    method: 'invoice',
    status: 'pending',
    invoiceId: data.id,
    invoiceNumber: data.invoice_number,
    dueDate: data.due_date
  };
}
