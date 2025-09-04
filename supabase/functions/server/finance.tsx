import { Hono } from 'npm:hono@4';
import { cors } from 'npm:hono/cors';
import { supabaseAdmin } from './auth.tsx';
import Stripe from 'npm:stripe@16';

// Initialize Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || 'sk_test_dummy', {
  apiVersion: '2024-10-28',
});

const finance = new Hono();

// CORS configuration
finance.use('*', cors({
  origin: ['https://*.supabase.co', 'https://*.vercel.app', 'https://*.netlify.app'],
  credentials: true,
}));

// Helper function to generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `YS-${timestamp}-${random}`;
};

// Helper function to generate invoice number
const generateInvoiceNumber = (tenantId: string) => {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `INV-${year}-${timestamp}`;
};

// Helper function to calculate tax
const calculateTax = (amount: number, taxRate: number = 7.7, taxInclusive: boolean = true) => {
  if (taxInclusive) {
    const taxAmount = Math.round((amount * taxRate) / (100 + taxRate));
    const subtotal = amount - taxAmount;
    return { subtotal, taxAmount, total: amount };
  } else {
    const taxAmount = Math.round((amount * taxRate) / 100);
    const total = amount + taxAmount;
    return { subtotal: amount, taxAmount, total };
  }
};

// Create order with items
finance.post('/orders/create', async (c) => {
  try {
    const body = await c.req.json();
    const { 
      tenant_id, 
      customer_id, 
      studio_id, 
      location_id, 
      channel = 'web',
      customer_details,
      items,
      metadata = {}
    } = body;

    if (!tenant_id || !items || !Array.isArray(items) || items.length === 0) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Calculate order totals
    let subtotal_cents = 0;
    let tax_total_cents = 0;
    let total_cents = 0;

    const processedItems = items.map((item: any) => {
      const itemTotal = item.quantity * item.unit_price_cents;
      const taxCalc = calculateTax(itemTotal, item.tax_rate || 7.7, item.tax_inclusive !== false);
      
      subtotal_cents += taxCalc.subtotal;
      tax_total_cents += taxCalc.taxAmount;
      total_cents += taxCalc.total;

      return {
        ...item,
        total_price_cents: itemTotal,
        tax_amount_cents: taxCalc.taxAmount
      };
    });

    const orderNumber = generateOrderNumber();

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        tenant_id,
        customer_id,
        studio_id,
        location_id,
        order_number: orderNumber,
        channel,
        status: 'pending',
        currency: 'CHF',
        subtotal_cents,
        tax_total_cents,
        total_cents,
        customer_email: customer_details?.email,
        customer_name: customer_details?.name,
        customer_address: customer_details?.address,
        metadata
      })
      .select()
      .single();

    if (orderError) {
      console.error('Failed to create order:', orderError);
      return c.json({ error: 'Failed to create order' }, 500);
    }

    // Create order items
    const itemsWithOrderId = processedItems.map((item: any) => ({
      ...item,
      order_id: order.id,
      tenant_id
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsError) {
      console.error('Failed to create order items:', itemsError);
      return c.json({ error: 'Failed to create order items' }, 500);
    }

    return c.json({
      success: true,
      data: {
        ...order,
        items: itemsWithOrderId
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get orders with filters
finance.get('/orders/:tenant_id', async (c) => {
  try {
    const tenant_id = c.req.param('tenant_id');
    const { status, customer_id, studio_id, date_from, date_to, limit = 50, offset = 0 } = c.req.query();

    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          id, item_type, name, quantity, unit_price_cents, total_price_cents,
          tax_rate, tax_amount_cents, description, sku
        ),
        payments (
          id, method, provider, amount_cents, status, created_at,
          provider_payment_id
        )
      `)
      .eq('tenant_id', tenant_id)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (customer_id) query = query.eq('customer_id', customer_id);
    if (studio_id) query = query.eq('studio_id', studio_id);
    if (date_from) query = query.gte('created_at', date_from);
    if (date_to) query = query.lte('created_at', date_to);
    
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch orders:', error);
      return c.json({ error: 'Failed to fetch orders' }, 500);
    }

    return c.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get single order
finance.get('/orders/:tenant_id/:order_id', async (c) => {
  try {
    const tenant_id = c.req.param('tenant_id');
    const order_id = c.req.param('order_id');

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (*),
        payments (*),
        refunds (*),
        invoices (*)
      `)
      .eq('tenant_id', tenant_id)
      .eq('id', order_id)
      .single();

    if (error) {
      console.error('Failed to fetch order:', error);
      return c.json({ error: 'Order not found' }, 404);
    }

    return c.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching order:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Process payment
finance.post('/payments/process', async (c) => {
  try {
    const body = await c.req.json();
    const {
      tenant_id,
      order_id,
      payment_method,
      provider = 'stripe',
      provider_payment_id,
      amount_cents,
      fee_amount_cents = 0,
      metadata = {}
    } = body;

    if (!tenant_id || !order_id || !payment_method || !amount_cents) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Get order to validate
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const net_amount_cents = amount_cents - fee_amount_cents;

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        tenant_id,
        order_id,
        method: payment_method,
        provider,
        provider_payment_id,
        amount_cents,
        fee_amount_cents,
        net_amount_cents,
        currency: 'CHF',
        status: 'captured',
        captured_at: new Date().toISOString(),
        metadata
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Failed to create payment:', paymentError);
      return c.json({ error: 'Failed to process payment' }, 500);
    }

    // Update order status
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', order_id);

    if (updateError) {
      console.error('Failed to update order:', updateError);
    }

    return c.json({ success: true, data: payment });
  } catch (error) {
    console.error('Error processing payment:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get payments
finance.get('/payments/:tenant_id', async (c) => {
  try {
    const tenant_id = c.req.param('tenant_id');
    const { order_id, status, method, date_from, date_to, limit = 50 } = c.req.query();

    let query = supabaseAdmin
      .from('payments')
      .select(`
        *,
        orders!inner (
          id, order_number, customer_name, customer_email, total_cents
        )
      `)
      .eq('tenant_id', tenant_id)
      .order('created_at', { ascending: false });

    if (order_id) query = query.eq('order_id', order_id);
    if (status) query = query.eq('status', status);
    if (method) query = query.eq('method', method);
    if (date_from) query = query.gte('created_at', date_from);
    if (date_to) query = query.lte('created_at', date_to);
    if (limit) query = query.limit(parseInt(limit));

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch payments:', error);
      return c.json({ error: 'Failed to fetch payments' }, 500);
    }

    return c.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Process refund
finance.post('/refunds/process', async (c) => {
  try {
    const body = await c.req.json();
    const {
      tenant_id,
      order_id,
      payment_id,
      amount_cents,
      reason,
      reason_code,
      initiated_by,
      notes
    } = body;

    if (!tenant_id || !order_id || !amount_cents || !reason) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Generate refund number
    const refund_number = `REF-${Date.now().toString().slice(-8)}`;

    // Create refund record
    const { data: refund, error: refundError } = await supabaseAdmin
      .from('refunds')
      .insert({
        tenant_id,
        order_id,
        payment_id,
        refund_number,
        amount_cents,
        currency: 'CHF',
        reason,
        reason_code,
        status: 'completed',
        initiated_by,
        notes,
        processed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (refundError) {
      console.error('Failed to create refund:', refundError);
      return c.json({ error: 'Failed to process refund' }, 500);
    }

    // Update order status if fully refunded
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('total_cents')
      .eq('id', order_id)
      .single();

    if (order && amount_cents >= order.total_cents) {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'refunded' })
        .eq('id', order_id);
    }

    return c.json({ success: true, data: refund });
  } catch (error) {
    console.error('Error processing refund:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get refunds
finance.get('/refunds/:tenant_id', async (c) => {
  try {
    const tenant_id = c.req.param('tenant_id');
    const { order_id, status, date_from, date_to, limit = 50 } = c.req.query();

    let query = supabaseAdmin
      .from('refunds')
      .select(`
        *,
        orders!inner (
          id, order_number, customer_name, customer_email
        ),
        payments (
          id, method, provider
        )
      `)
      .eq('tenant_id', tenant_id)
      .order('created_at', { ascending: false });

    if (order_id) query = query.eq('order_id', order_id);
    if (status) query = query.eq('status', status);
    if (date_from) query = query.gte('created_at', date_from);
    if (date_to) query = query.lte('created_at', date_to);
    if (limit) query = query.limit(parseInt(limit));

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch refunds:', error);
      return c.json({ error: 'Failed to fetch refunds' }, 500);
    }

    return c.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching refunds:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Generate invoice
finance.post('/invoices/generate', async (c) => {
  try {
    const body = await c.req.json();
    const { tenant_id, order_id, due_days = 30 } = body;

    if (!tenant_id || !order_id) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Get order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('tenant_id', tenant_id)
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const invoice_number = generateInvoiceNumber(tenant_id);
    const invoice_date = new Date().toISOString().split('T')[0];
    const due_date = new Date(Date.now() + due_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Create tax breakdown
    const tax_breakdown = {
      rate: 7.7,
      amount_cents: order.tax_total_cents,
      basis_cents: order.subtotal_cents
    };

    // Generate QR-bill reference (Swiss standard)
    const qr_bill_reference = `YS${tenant_id.replace(/-/g, '').slice(0, 8)}${Date.now().toString().slice(-8)}`;

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .insert({
        tenant_id,
        order_id,
        invoice_number,
        invoice_date,
        due_date,
        customer_id: order.customer_id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_address: order.customer_address,
        subtotal_cents: order.subtotal_cents,
        tax_total_cents: order.tax_total_cents,
        total_cents: order.total_cents,
        currency: 'CHF',
        tax_mode: 'inclusive',
        tax_breakdown,
        qr_bill_reference,
        status: 'draft'
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('Failed to create invoice:', invoiceError);
      return c.json({ error: 'Failed to generate invoice' }, 500);
    }

    return c.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get invoices
finance.get('/invoices/:tenant_id', async (c) => {
  try {
    const tenant_id = c.req.param('tenant_id');
    const { customer_id, status, date_from, date_to, limit = 50 } = c.req.query();

    let query = supabaseAdmin
      .from('invoices')
      .select(`
        *,
        orders!inner (
          id, order_number, total_cents
        )
      `)
      .eq('tenant_id', tenant_id)
      .order('invoice_date', { ascending: false });

    if (customer_id) query = query.eq('customer_id', customer_id);
    if (status) query = query.eq('status', status);
    if (date_from) query = query.gte('invoice_date', date_from);
    if (date_to) query = query.lte('invoice_date', date_to);
    if (limit) query = query.limit(parseInt(limit));

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch invoices:', error);
      return c.json({ error: 'Failed to fetch invoices' }, 500);
    }

    return c.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Financial summary/reports
finance.get('/reports/summary/:tenant_id', async (c) => {
  try {
    const tenant_id = c.req.param('tenant_id');
    const { period_start, period_end } = c.req.query();

    if (!period_start || !period_end) {
      return c.json({ error: 'Missing period parameters' }, 400);
    }

    // Check if database tables exist by trying a simple query first
    let ordersData = [];
    let paymentsData = [];
    let walletsData = [];

    try {
      // Get orders data with error handling
      const { data: ordersResult, error: ordersError } = await supabaseAdmin
        .from('orders')
        .select('status, total_cents, created_at')
        .eq('tenant_id', tenant_id)
        .gte('created_at', period_start)
        .lte('created_at', period_end)
        .limit(1000); // Limit to prevent timeouts

      if (ordersError) {
        console.warn('Orders table not available or query failed:', ordersError.message);
        ordersData = [];
      } else {
        ordersData = ordersResult || [];
      }
    } catch (error) {
      console.warn('Orders query failed:', error.message);
      ordersData = [];
    }

    try {
      // Get payments data with error handling
      const { data: paymentsResult, error: paymentsError } = await supabaseAdmin
        .from('payments')
        .select('method, amount_cents, fee_amount_cents, status, captured_at')
        .eq('tenant_id', tenant_id)
        .gte('created_at', period_start)
        .lte('created_at', period_end)
        .limit(1000);

      if (paymentsError) {
        console.warn('Payments table not available or query failed:', paymentsError.message);
        paymentsData = [];
      } else {
        paymentsData = paymentsResult || [];
      }
    } catch (error) {
      console.warn('Payments query failed:', error.message);
      paymentsData = [];
    }

    try {
      // Get wallets data with error handling
      const { data: walletsResult, error: walletsError } = await supabaseAdmin
        .from('customer_wallets')
        .select('balance_cents, total_credits')
        .eq('tenant_id', tenant_id)
        .limit(1000);

      if (walletsError) {
        console.warn('Wallets table not available or query failed:', walletsError.message);
        walletsData = [];
      } else {
        walletsData = walletsResult || [];
      }
    } catch (error) {
      console.warn('Wallets query failed:', error.message);
      walletsData = [];
    }

    // Calculate metrics with safe fallbacks
    const completedOrders = ordersData.filter(o => o.status === 'completed');
    const capturedPayments = paymentsData.filter(p => p.status === 'captured');

    const total_revenue_cents = completedOrders.reduce((sum, o) => sum + (o.total_cents || 0), 0);
    const total_payments_cents = capturedPayments.reduce((sum, p) => sum + (p.amount_cents || 0), 0);
    const total_fees_cents = capturedPayments.reduce((sum, p) => sum + (p.fee_amount_cents || 0), 0);
    const net_revenue_cents = total_payments_cents - total_fees_cents;
    const wallet_liability_cents = walletsData.reduce((sum, w) => sum + (w.balance_cents || 0), 0);
    const credit_liability = walletsData.reduce((sum, w) => sum + (w.total_credits || 0), 0);

    const summary = {
      total_revenue_cents,
      total_payments_cents,
      total_fees_cents,
      net_revenue_cents,
      wallet_liability_cents,
      credit_liability,
      order_count: ordersData.length,
      payment_count: paymentsData.length,
      average_order_value_cents: completedOrders.length ? Math.round(total_revenue_cents / completedOrders.length) : 0,
      // Add metadata to indicate if this is fallback data
      metadata: {
        orders_available: ordersData.length > 0,
        payments_available: paymentsData.length > 0,
        wallets_available: walletsData.length > 0,
        is_fallback: ordersData.length === 0 && paymentsData.length === 0 && walletsData.length === 0
      }
    };

    return c.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error generating financial summary:', error);
    
    // Return fallback data instead of 500 error
    const fallbackSummary = {
      total_revenue_cents: 0,
      total_payments_cents: 0,
      total_fees_cents: 0,
      net_revenue_cents: 0,
      wallet_liability_cents: 0,
      credit_liability: 0,
      order_count: 0,
      payment_count: 0,
      average_order_value_cents: 0,
      metadata: {
        orders_available: false,
        payments_available: false,
        wallets_available: false,
        is_fallback: true,
        error: 'Database tables not available'
      }
    };

    return c.json({ success: true, data: fallbackSummary });
  }
});

// Customer wallet management
finance.get('/wallets/:tenant_id', async (c) => {
  try {
    const tenant_id = c.req.param('tenant_id');
    const { customer_id } = c.req.query();

    let query = supabaseAdmin
      .from('customer_wallets')
      .select(`
        *,
        customers:customer_id (
          first_name, last_name, email
        )
      `)
      .eq('tenant_id', tenant_id)
      .order('created_at', { ascending: false });

    if (customer_id) {
      query = query.eq('customer_id', customer_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch wallets:', error);
      return c.json({ error: 'Failed to fetch wallets' }, 500);
    }

    // Transform data to include customer info in wallet objects
    const wallets = (data || []).map(wallet => ({
      ...wallet,
      customer_name: wallet.customers ? `${wallet.customers.first_name || ''} ${wallet.customers.last_name || ''}`.trim() : 'Unknown Customer',
      customer_email: wallet.customers?.email || null
    }));

    return c.json({ success: true, wallets });
  } catch (error) {
    console.error('Error fetching wallets:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get wallet packages
finance.get('/orgs/:org_id/packages', async (c) => {
  try {
    const org_id = c.req.param('org_id');

    const { data, error } = await supabaseAdmin
      .from('wallet_packages')
      .select('*')
      .eq('org_id', org_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch packages:', error);
      return c.json({ error: 'Failed to fetch packages' }, 500);
    }

    return c.json({ success: true, packages: data || [] });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create wallet package
finance.post('/orgs/:org_id/packages', async (c) => {
  try {
    const org_id = c.req.param('org_id');
    const body = await c.req.json();

    const { data, error } = await supabaseAdmin
      .from('wallet_packages')
      .insert({
        org_id,
        ...body
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create package:', error);
      return c.json({ error: 'Failed to create package' }, 500);
    }

    return c.json({ success: true, data });
  } catch (error) {
    console.error('Error creating package:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Add funds to wallet
finance.post('/orgs/:org_id/wallets/:wallet_id/add', async (c) => {
  try {
    const org_id = c.req.param('org_id');
    const wallet_id = c.req.param('wallet_id');
    const body = await c.req.json();
    
    const { amount_cents, credits, reason, description } = body;

    // Get current wallet
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from('customer_wallets')
      .select('*')
      .eq('id', wallet_id)
      .eq('tenant_id', org_id)
      .single();

    if (walletError || !wallet) {
      return c.json({ error: 'Wallet not found' }, 404);
    }

    // Update wallet balance
    const { error: updateError } = await supabaseAdmin
      .from('customer_wallets')
      .update({
        balance_cents: wallet.balance_cents + amount_cents,
        total_credits: wallet.total_credits + credits,
        updated_at: new Date().toISOString()
      })
      .eq('id', wallet_id);

    if (updateError) {
      console.error('Failed to update wallet:', updateError);
      return c.json({ error: 'Failed to update wallet' }, 500);
    }

    // Create transaction record
    const { error: transactionError } = await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        wallet_id,
        entry_type: 'credit',
        amount_cents,
        credits_delta: credits,
        timestamp: new Date().toISOString(),
        reason,
        metadata: { description }
      });

    if (transactionError) {
      console.error('Failed to create transaction:', transactionError);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error adding funds:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get wallet transaction history
finance.get('/orgs/:org_id/wallets/:wallet_id/history', async (c) => {
  try {
    const wallet_id = c.req.param('wallet_id');

    const { data, error } = await supabaseAdmin
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', wallet_id)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Failed to fetch wallet history:', error);
      return c.json({ error: 'Failed to fetch wallet history' }, 500);
    }

    return c.json({ success: true, history: data || [] });
  } catch (error) {
    console.error('Error fetching wallet history:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Cash drawer management endpoints
finance.get('/cash-drawers/:tenant_id', async (c) => {
  try {
    const tenant_id = c.req.param('tenant_id');

    const { data, error } = await supabaseAdmin
      .from('cash_drawers')
      .select(`
        *,
        user:user_id (first_name, last_name)
      `)
      .eq('tenant_id', tenant_id)
      .order('opened_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch cash drawers:', error);
      return c.json({ error: 'Failed to fetch cash drawers' }, 500);
    }

    return c.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching cash drawers:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Open cash drawer
finance.post('/cash-drawers/:tenant_id/open', async (c) => {
  try {
    const tenant_id = c.req.param('tenant_id');
    const body = await c.req.json();
    const { location, user_id, opening_float_cents } = body;

    const { data, error } = await supabaseAdmin
      .from('cash_drawers')
      .insert({
        tenant_id,
        location,
        user_id,
        status: 'open',
        opened_at: new Date().toISOString(),
        opening_float_cents,
        current_balance_cents: opening_float_cents,
        total_sales_cents: 0,
        total_refunds_cents: 0,
        transaction_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to open cash drawer:', error);
      return c.json({ error: 'Failed to open cash drawer' }, 500);
    }

    return c.json({ success: true, data });
  } catch (error) {
    console.error('Error opening cash drawer:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Close cash drawer
finance.post('/cash-drawers/:drawer_id/close', async (c) => {
  try {
    const drawer_id = c.req.param('drawer_id');
    const body = await c.req.json();
    const { actual_cash_cents, variance_cents } = body;

    const { data, error } = await supabaseAdmin
      .from('cash_drawers')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
        actual_cash_cents,
        variance_cents
      })
      .eq('id', drawer_id)
      .select()
      .single();

    if (error) {
      console.error('Failed to close cash drawer:', error);
      return c.json({ error: 'Failed to close cash drawer' }, 500);
    }

    return c.json({ success: true, data });
  } catch (error) {
    console.error('Error closing cash drawer:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Record cash transaction
finance.post('/cash-drawers/:drawer_id/transaction', async (c) => {
  try {
    const drawer_id = c.req.param('drawer_id');
    const body = await c.req.json();
    const { type, amount_cents, description, customer_name, rounding_adjustment } = body;

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('cash_transactions')
      .insert({
        drawer_id,
        type,
        amount_cents,
        description,
        customer_name,
        timestamp: new Date().toISOString(),
        rounding_adjustment: rounding_adjustment || 0
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Failed to create cash transaction:', transactionError);
      return c.json({ error: 'Failed to create transaction' }, 500);
    }

    // Update drawer totals
    const { error: updateError } = await supabaseAdmin.rpc('update_drawer_totals', {
      p_drawer_id: drawer_id
    });

    if (updateError) {
      console.error('Failed to update drawer totals:', updateError);
    }

    return c.json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error recording cash transaction:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Add wallet funds
finance.post('/wallets/add-funds', async (c) => {
  try {
    const body = await c.req.json();
    const {
      tenant_id,
      customer_id,
      studio_id,
      instructor_id,
      amount_cents = 0,
      credits = 0,
      reason = 'manual_adjustment',
      description,
      initiated_by
    } = body;

    if (!tenant_id || !customer_id || (amount_cents === 0 && credits === 0)) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Get or create wallet
    let { data: wallet, error: walletError } = await supabaseAdmin
      .from('customer_wallets')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('customer_id', customer_id)
      .eq('studio_id', studio_id || null)
      .eq('instructor_id', instructor_id || null)
      .single();

    if (walletError && walletError.code === 'PGRST116') {
      // Create new wallet
      const { data: newWallet, error: createError } = await supabaseAdmin
        .from('customer_wallets')
        .insert({
          tenant_id,
          customer_id,
          studio_id,
          instructor_id,
          wallet_type: 'customer',
          currency: 'CHF',
          balance_cents: amount_cents,
          available_cents: amount_cents,
          total_credits: credits,
          available_credits: credits,
          status: 'active'
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create wallet:', createError);
        return c.json({ error: 'Failed to create wallet' }, 500);
      }
      wallet = newWallet;
    } else if (walletError) {
      console.error('Failed to fetch wallet:', walletError);
      return c.json({ error: 'Failed to fetch wallet' }, 500);
    } else {
      // Update existing wallet
      const { error: updateError } = await supabaseAdmin
        .from('customer_wallets')
        .update({
          balance_cents: wallet.balance_cents + amount_cents,
          available_cents: wallet.available_cents + amount_cents,
          total_credits: wallet.total_credits + credits,
          available_credits: wallet.available_credits + credits
        })
        .eq('id', wallet.id);

      if (updateError) {
        console.error('Failed to update wallet:', updateError);
        return c.json({ error: 'Failed to update wallet' }, 500);
      }
    }

    // Create ledger entry
    const { error: ledgerError } = await supabaseAdmin
      .from('wallet_ledger')
      .insert({
        wallet_id: wallet.id,
        tenant_id,
        entry_type: 'credit',
        amount_cents,
        credits_delta: credits,
        balance_after_cents: wallet.balance_cents + amount_cents,
        credits_after: wallet.total_credits + credits,
        reference_type: reason,
        description: description || 'Manual funds addition',
        initiated_by
      });

    if (ledgerError) {
      console.error('Failed to create ledger entry:', ledgerError);
    }

    return c.json({ 
      success: true, 
      data: {
        wallet_id: wallet.id,
        new_balance_cents: wallet.balance_cents + amount_cents,
        new_credits: wallet.total_credits + credits
      }
    });
  } catch (error) {
    console.error('Error adding wallet funds:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get wallet transaction history
finance.get('/wallets/:wallet_id/history', async (c) => {
  try {
    const wallet_id = c.req.param('wallet_id');
    const { limit = 50 } = c.req.query();

    const { data, error } = await supabaseAdmin
      .from('wallet_ledger')
      .select('*')
      .eq('wallet_id', wallet_id)
      .order('transaction_timestamp', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error('Failed to fetch wallet history:', error);
      return c.json({ error: 'Failed to fetch wallet history' }, 500);
    }

    return c.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching wallet history:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default finance;