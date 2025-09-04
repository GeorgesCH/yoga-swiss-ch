import { Hono } from 'npm:hono@4';
import { cors } from 'npm:hono/cors';
import Stripe from 'npm:stripe@16';
import { supabaseAdmin } from './auth.tsx';

// Initialize Stripe with test mode
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-10-28',
});

const payments = new Hono();

// CORS for payment endpoints
payments.use('*', cors({
  origin: ['https://*.supabase.co', 'https://*.vercel.app', 'https://*.netlify.app'],
  credentials: true,
}));

// Swiss payment configuration
const SWISS_CONFIG = {
  currency: 'CHF',
  taxRate: 7.7, // Swiss VAT rate
  supportedPaymentMethods: ['card', 'twint', 'apple_pay', 'google_pay'],
  locale: 'de-CH', // Default locale
};

// Create Stripe payment intent
payments.post('/stripe/create-intent', async (c) => {
  try {
    const body = await c.req.json();
    const { amount, currency = 'CHF', orderId, customerId, orgId } = body;

    // Validate required fields
    if (!amount || !orderId || !customerId || !orgId) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        orderId,
        customerId,
        orgId,
        platform: 'yogaswiss'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update order with payment intent ID
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_intent_id: paymentIntent.id,
        payment_status: 'processing'
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to update order:', updateError);
    }

    return c.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe payment intent creation failed:', error);
    return c.json({ error: 'Failed to create payment intent' }, 500);
  }
});

// TWINT payment integration (sandbox)
payments.post('/twint/create-payment', async (c) => {
  try {
    const body = await c.req.json();
    const { amount, currency = 'CHF', orderId, customerId, orgId } = body;

    // Validate required fields
    if (!amount || !orderId || !customerId || !orgId) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // TWINT sandbox integration (mock for now)
    // In production, this would integrate with actual TWINT API
    const twintTransactionId = `twint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate TWINT payment flow
    const twintPayment = {
      transactionId: twintTransactionId,
      amount: amount,
      currency: currency,
      status: 'pending',
      qrCode: `https://sandbox.twint.ch/pay?amount=${amount}&currency=${currency}&ref=${twintTransactionId}`,
      deepLink: `twint://pay?amount=${amount}&currency=${currency}&ref=${twintTransactionId}`,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    };

    // Update order with TWINT transaction ID
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        twint_transaction_id: twintTransactionId,
        payment_status: 'processing'
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to update order:', updateError);
    }

    return c.json(twintPayment);
  } catch (error) {
    console.error('TWINT payment creation failed:', error);
    return c.json({ error: 'Failed to create TWINT payment' }, 500);
  }
});

// Generate Swiss QR-bill
payments.post('/qr-bill/generate', async (c) => {
  try {
    const body = await c.req.json();
    const { orderId, customerId, orgId } = body;

    // Get order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    // Get customer details
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', customerId)
      .single();

    if (customerError || !customer) {
      return c.json({ error: 'Customer not found' }, 404);
    }

    // Get organization details
    const { data: org, error: orgError } = await supabaseAdmin
      .from('orgs')
      .select('*')
      .eq('id', orgId)
      .single();

    if (orgError || !org) {
      return c.json({ error: 'Organization not found' }, 404);
    }

    // Generate invoice number
    const invoiceNumber = `YS-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // Swiss QR-bill data structure
    const qrBillData = {
      // Creditor (organization)
      creditor: {
        name: org.name,
        address: org.address || '',
        city: org.city || '',
        postalCode: org.postal_code || '',
        country: 'CH'
      },
      // Payment amount
      amount: order.total_amount,
      currency: 'CHF',
      // Debtor (customer)
      debtor: {
        name: customer.full_name || '',
        address: '', // Would need to be collected during checkout
        city: '',
        postalCode: '',
        country: 'CH'
      },
      // Reference
      reference: invoiceNumber,
      // Additional information
      additionalInfo: `YogaSwiss Order #${orderId}`,
      // Due date (30 days from now)
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    // Generate QR code (simplified - in production use proper QR-bill library)
    const qrCodeData = `SPC\n0200\n1\n${org.name}\n${org.address}\n${org.postal_code} ${org.city}\nCH\n\n\n\n\n\n${order.total_amount}\nCHF\n${customer.full_name}\n\n\n\n\n\n\nNON\n\n${invoiceNumber}\nEPD`;
    
    // In production, you would use a proper QR-bill library to generate the QR code and PDF
    const qrCodeUrl = `data:image/svg+xml;base64,${btoa(`<svg>QR Code for ${invoiceNumber}</svg>`)}`;

    // Create invoice record
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .insert({
        order_id: orderId,
        customer_id: customerId,
        org_id: orgId,
        invoice_number: invoiceNumber,
        status: 'sent',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: qrBillData.dueDate,
        subtotal: order.subtotal,
        tax_amount: order.tax_amount,
        total_amount: order.total_amount,
        currency: 'CHF',
        qr_bill_data: qrBillData,
        qr_code_url: qrCodeUrl,
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('Failed to create invoice:', invoiceError);
      return c.json({ error: 'Failed to create invoice' }, 500);
    }

    return c.json({
      invoice,
      qrBillData,
      qrCodeUrl,
      downloadUrl: `/api/invoices/${invoice.id}/pdf` // Would generate PDF
    });
  } catch (error) {
    console.error('QR-bill generation failed:', error);
    return c.json({ error: 'Failed to generate QR-bill' }, 500);
  }
});

// Webhook endpoint for payment status updates
payments.post('/webhooks/stripe', async (c) => {
  try {
    const body = await c.req.text();
    const signature = c.req.header('stripe-signature');

    if (!signature) {
      return c.json({ error: 'Missing signature' }, 400);
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );

    // Handle payment intent succeeded
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { orderId } = paymentIntent.metadata;

      // Update order status
      const { error } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'completed',
          payment_status: 'completed'
        })
        .eq('id', orderId);

      if (error) {
        console.error('Failed to update order status:', error);
      }

      // Update invoice status if exists
      await supabaseAdmin
        .from('invoices')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0]
        })
        .eq('order_id', orderId);
    }

    // Handle payment intent failed
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { orderId } = paymentIntent.metadata;

      // Update order status
      await supabaseAdmin
        .from('orders')
        .update({
          status: 'cancelled',
          payment_status: 'failed'
        })
        .eq('id', orderId);
    }

    return c.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return c.json({ error: 'Webhook error' }, 400);
  }
});

// Process refund
payments.post('/refunds/create', async (c) => {
  try {
    const body = await c.req.json();
    const { orderId, amount, reason } = body;

    // Get order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    let refundId = null;

    // Process refund based on payment method
    if (order.payment_method === 'credit_card' && order.payment_intent_id) {
      // Stripe refund
      const refund = await stripe.refunds.create({
        payment_intent: order.payment_intent_id,
        amount: amount ? Math.round(amount * 100) : undefined, // Partial or full refund
        reason: 'requested_by_customer',
        metadata: {
          orderId: orderId,
          reason: reason
        }
      });
      refundId = refund.id;
    } else if (order.payment_method === 'twint') {
      // TWINT refund (would integrate with TWINT API)
      refundId = `twint_refund_${Date.now()}`;
    }

    // Update order status
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: amount && amount < order.total_amount ? 'completed' : 'refunded',
        payment_status: 'refunded'
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to update order:', updateError);
    }

    return c.json({
      refundId,
      amount: amount || order.total_amount,
      status: 'processed'
    });
  } catch (error) {
    console.error('Refund processing failed:', error);
    return c.json({ error: 'Failed to process refund' }, 500);
  }
});

// Get payment methods for organization
payments.get('/methods/:orgId', async (c) => {
  try {
    const orgId = c.req.param('orgId');

    // Get organization settings
    const { data: org, error } = await supabaseAdmin
      .from('orgs')
      .select('payment_methods, settings')
      .eq('id', orgId)
      .single();

    if (error || !org) {
      return c.json({ error: 'Organization not found' }, 404);
    }

    return c.json({
      paymentMethods: org.payment_methods || SWISS_CONFIG.supportedPaymentMethods,
      currency: SWISS_CONFIG.currency,
      taxRate: SWISS_CONFIG.taxRate,
      settings: org.settings?.payments || {}
    });
  } catch (error) {
    console.error('Failed to get payment methods:', error);
    return c.json({ error: 'Failed to get payment methods' }, 500);
  }
});

export default payments;