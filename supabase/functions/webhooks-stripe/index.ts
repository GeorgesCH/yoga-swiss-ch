// Stripe Webhooks Edge Function
import { createServiceClient } from "../_shared/supabase.ts";
import { createResponse, createErrorResponse } from "../_shared/utils.ts";

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return createErrorResponse("Method not allowed", 405);
  }

  try {
    const supabase = createServiceClient();
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!signature || !webhookSecret) {
      return createErrorResponse("Missing signature or webhook secret", 400);
    }

    const body = await req.text();
    
    // Verify webhook signature
    const isValid = await verifyStripeSignature(body, signature, webhookSecret);
    if (!isValid) {
      return createErrorResponse("Invalid signature", 401);
    }

    const event = JSON.parse(body);
    
    // Store webhook delivery for audit
    await supabase.from('webhook_deliveries').insert({
      webhook_url: req.url,
      event_type: event.type,
      payload: event,
      status: 'delivered'
    });

    // Process webhook event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(supabase, event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(supabase, event.data.object);
        break;
        
      case 'charge.refunded':
        await handleRefund(supabase, event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return createResponse({ received: true });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    return createErrorResponse("Webhook processing failed", 500);
  }
}

async function verifyStripeSignature(
  body: string, 
  signature: string, 
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    
    const sigElements = signature.split(',');
    const timestamp = sigElements.find(el => el.startsWith('t='))?.split('=')[1];
    const sig = sigElements.find(el => el.startsWith('v1='))?.split('=')[1];
    
    if (!timestamp || !sig) return false;
    
    const payload = `${timestamp}.${body}`;
    const expectedSig = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(payload)
    );
    
    const expectedSigHex = Array.from(new Uint8Array(expectedSig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return expectedSigHex === sig;
  } catch {
    return false;
  }
}

async function handlePaymentSucceeded(supabase: any, paymentIntent: any) {
  const { registrationId, eventId, organizationId } = paymentIntent.metadata;
  
  // Update payment record
  await supabase
    .from('payments')
    .update({
      status: 'paid',
      confirmed_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  // Emit outbox event for confirmation email
  await supabase.from('outbox_events').insert({
    organization_id: organizationId,
    type: 'payment.succeeded',
    payload: {
      registrationId,
      eventId,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    }
  });
}

async function handlePaymentFailed(supabase: any, paymentIntent: any) {
  const { registrationId, eventId, organizationId } = paymentIntent.metadata;
  
  // Update payment record
  await supabase
    .from('payments')
    .update({
      status: 'failed',
      failed_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  // Cancel the registration
  await supabase.rpc('cancel_registration', {
    p_registration_id: registrationId,
    p_reason: 'Payment failed',
    p_actor_id: null
  });

  // Emit outbox event for failure notification
  await supabase.from('outbox_events').insert({
    organization_id: organizationId,
    type: 'payment.failed',
    payload: {
      registrationId,
      eventId,
      paymentIntentId: paymentIntent.id,
      failureReason: paymentIntent.last_payment_error?.message
    }
  });
}

async function handleRefund(supabase: any, charge: any) {
  // Update payment record for refund
  await supabase.from('payments').insert({
    organization_id: charge.metadata.organizationId,
    customer_id: charge.metadata.customerId,
    amount_cents: -charge.amount_refunded,
    currency: charge.currency.toUpperCase(),
    payment_method: 'card',
    status: 'refunded',
    stripe_payment_intent_id: charge.id,
    confirmed_at: new Date().toISOString(),
    metadata: {
      originalChargeId: charge.id,
      refundReason: charge.refunds.data[0]?.reason
    }
  });
}
