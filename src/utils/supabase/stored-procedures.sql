-- Supabase stored procedures for YogaSwiss Core Operations
-- Run these in your Supabase SQL editor

-- ==================== WALLET OPERATIONS ====================

-- Function to add wallet credit
CREATE OR REPLACE FUNCTION add_wallet_credit(
  p_customer_id uuid,
  p_org_id uuid,
  p_amount decimal,
  p_reason text,
  p_reference_type text,
  p_reference_id text
) RETURNS json AS $$
DECLARE
  v_wallet_id uuid;
  v_new_balance decimal;
  v_transaction_id uuid;
BEGIN
  -- Get or create wallet
  SELECT id, balance INTO v_wallet_id, v_new_balance
  FROM wallets 
  WHERE customer_id = p_customer_id AND org_id = p_org_id AND is_active = true;

  IF v_wallet_id IS NULL THEN
    -- Create new wallet
    INSERT INTO wallets (customer_id, org_id, balance, currency, is_active)
    VALUES (p_customer_id, p_org_id, p_amount, 'CHF', true)
    RETURNING id, balance INTO v_wallet_id, v_new_balance;
  ELSE
    -- Update existing wallet
    UPDATE wallets 
    SET balance = balance + p_amount, updated_at = now()
    WHERE id = v_wallet_id
    RETURNING balance INTO v_new_balance;
  END IF;

  -- Create transaction record
  INSERT INTO wallet_transactions (
    wallet_id, customer_id, org_id, type, amount, balance_after,
    reason, reference_type, reference_id
  ) VALUES (
    v_wallet_id, p_customer_id, p_org_id, 'credit', p_amount, v_new_balance,
    p_reason, p_reference_type, p_reference_id
  ) RETURNING id INTO v_transaction_id;

  RETURN json_build_object(
    'success', true,
    'wallet_id', v_wallet_id,
    'new_balance', v_new_balance,
    'transaction_id', v_transaction_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct wallet credit
CREATE OR REPLACE FUNCTION deduct_wallet_credit(
  p_customer_id uuid,
  p_org_id uuid,
  p_amount decimal,
  p_reason text,
  p_reference_type text,
  p_reference_id text
) RETURNS json AS $$
DECLARE
  v_wallet_id uuid;
  v_current_balance decimal;
  v_new_balance decimal;
  v_transaction_id uuid;
BEGIN
  -- Get wallet and check balance
  SELECT id, balance INTO v_wallet_id, v_current_balance
  FROM wallets 
  WHERE customer_id = p_customer_id AND org_id = p_org_id AND is_active = true;

  IF v_wallet_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Wallet not found'
    );
  END IF;

  IF v_current_balance < p_amount THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient balance'
    );
  END IF;

  -- Update wallet balance
  UPDATE wallets 
  SET balance = balance - p_amount, updated_at = now()
  WHERE id = v_wallet_id
  RETURNING balance INTO v_new_balance;

  -- Create transaction record
  INSERT INTO wallet_transactions (
    wallet_id, customer_id, org_id, type, amount, balance_after,
    reason, reference_type, reference_id
  ) VALUES (
    v_wallet_id, p_customer_id, p_org_id, 'debit', p_amount, v_new_balance,
    p_reason, p_reference_type, p_reference_id
  ) RETURNING id INTO v_transaction_id;

  RETURN json_build_object(
    'success', true,
    'wallet_id', v_wallet_id,
    'new_balance', v_new_balance,
    'transaction_id', v_transaction_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== BOOKING OPERATIONS ====================

-- Function to create a booking with payment processing
CREATE OR REPLACE FUNCTION create_booking_transaction(
  p_occurrence_id uuid,
  p_customer_id uuid,
  p_org_id uuid,
  p_payment_method text,
  p_amount decimal,
  p_notes text DEFAULT NULL
) RETURNS json AS $$
DECLARE
  v_occurrence record;
  v_registration_id uuid;
  v_status text;
  v_waitlist_position int;
BEGIN
  -- Get class occurrence details
  SELECT * INTO v_occurrence
  FROM class_occurrences
  WHERE id = p_occurrence_id AND status = 'scheduled';

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Class not found or not available for booking'
    );
  END IF;

  -- Check if customer already has a booking
  IF EXISTS (
    SELECT 1 FROM registrations 
    WHERE occurrence_id = p_occurrence_id 
    AND customer_id = p_customer_id 
    AND status IN ('confirmed', 'waitlisted')
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Customer already registered for this class'
    );
  END IF;

  -- Determine status and waitlist position
  IF v_occurrence.booked_count < v_occurrence.capacity THEN
    v_status := 'confirmed';
    v_waitlist_position := NULL;
    
    -- Update class booked count
    UPDATE class_occurrences 
    SET booked_count = booked_count + 1
    WHERE id = p_occurrence_id;
  ELSE
    v_status := 'waitlisted';
    SELECT COALESCE(MAX(waitlist_position), 0) + 1 INTO v_waitlist_position
    FROM registrations 
    WHERE occurrence_id = p_occurrence_id AND status = 'waitlisted';
    
    -- Update class waitlist count
    UPDATE class_occurrences 
    SET waitlist_count = waitlist_count + 1
    WHERE id = p_occurrence_id;
  END IF;

  -- Create registration
  INSERT INTO registrations (
    occurrence_id, customer_id, org_id, status, booked_at,
    waitlist_position, payment_status, payment_method, notes
  ) VALUES (
    p_occurrence_id, p_customer_id, p_org_id, v_status, now(),
    v_waitlist_position, 
    CASE WHEN p_payment_method IN ('membership', 'pass') THEN 'free' ELSE 'paid' END,
    p_payment_method, p_notes
  ) RETURNING id INTO v_registration_id;

  -- Handle payment deduction for wallet/pass payments
  IF p_payment_method = 'wallet' THEN
    PERFORM deduct_wallet_credit(
      p_customer_id, p_org_id, p_amount,
      'Class booking: ' || v_occurrence.id,
      'booking', v_registration_id::text
    );
  ELSIF p_payment_method LIKE 'pass-%' THEN
    -- Use pass credit (implement pass credit deduction)
    PERFORM use_pass_credit(
      substring(p_payment_method from 6)::uuid,
      p_occurrence_id
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'registration_id', v_registration_id,
    'status', v_status,
    'waitlist_position', v_waitlist_position
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== PASS OPERATIONS ====================

-- Function to use pass credit
CREATE OR REPLACE FUNCTION use_pass_credit(
  p_pass_id uuid,
  p_occurrence_id uuid
) RETURNS json AS $$
DECLARE
  v_pass record;
  v_credits_remaining int;
BEGIN
  -- Get pass details
  SELECT * INTO v_pass
  FROM passes
  WHERE id = p_pass_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Pass not found or inactive'
    );
  END IF;

  -- Check if pass is valid
  IF v_pass.valid_until IS NOT NULL AND v_pass.valid_until < now() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Pass has expired'
    );
  END IF;

  -- Calculate remaining credits
  v_credits_remaining := COALESCE(v_pass.credits_total, 0) - COALESCE(v_pass.credits_used, 0);

  IF v_credits_remaining <= 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No credits remaining on pass'
    );
  END IF;

  -- Update pass credits
  UPDATE passes
  SET credits_used = COALESCE(credits_used, 0) + 1,
      updated_at = now()
  WHERE id = p_pass_id;

  RETURN json_build_object(
    'success', true,
    'credits_remaining', v_credits_remaining - 1
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to refund pass credit
CREATE OR REPLACE FUNCTION refund_pass_credit(
  p_pass_id uuid,
  p_occurrence_id uuid
) RETURNS json AS $$
DECLARE
  v_pass record;
BEGIN
  -- Get pass details
  SELECT * INTO v_pass
  FROM passes
  WHERE id = p_pass_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Pass not found or inactive'
    );
  END IF;

  -- Check if credits can be refunded
  IF COALESCE(v_pass.credits_used, 0) <= 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No credits to refund'
    );
  END IF;

  -- Refund credit
  UPDATE passes
  SET credits_used = GREATEST(0, COALESCE(credits_used, 0) - 1),
      updated_at = now()
  WHERE id = p_pass_id;

  RETURN json_build_object(
    'success', true,
    'credits_remaining', COALESCE(v_pass.credits_total, 0) - GREATEST(0, COALESCE(v_pass.credits_used, 0) - 1)
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== ANALYTICS FUNCTIONS ====================

-- Function to get booking analytics
CREATE OR REPLACE FUNCTION get_booking_analytics(
  p_org_id uuid,
  p_start_date timestamp,
  p_end_date timestamp
) RETURNS json AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'total_bookings', COUNT(*),
    'confirmed_bookings', COUNT(*) FILTER (WHERE status = 'confirmed'),
    'waitlisted_bookings', COUNT(*) FILTER (WHERE status = 'waitlisted'),
    'cancelled_bookings', COUNT(*) FILTER (WHERE status = 'cancelled'),
    'no_shows', COUNT(*) FILTER (WHERE status = 'no_show'),
    'total_revenue', COALESCE(SUM(
      CASE WHEN r.payment_status = 'paid' 
      THEN co.price ELSE 0 END
    ), 0),
    'average_class_size', AVG(co.booked_count)
  ) INTO v_result
  FROM registrations r
  JOIN class_occurrences co ON r.occurrence_id = co.id
  WHERE r.org_id = p_org_id
    AND r.booked_at BETWEEN p_start_date AND p_end_date;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get cancellation analytics
CREATE OR REPLACE FUNCTION get_cancellation_analytics(
  p_org_id uuid,
  p_start_date timestamp,
  p_end_date timestamp
) RETURNS json AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'total_cancellations', COUNT(*),
    'customer_cancellations', COUNT(*) FILTER (WHERE cancellation_reason LIKE '%customer%'),
    'instructor_cancellations', COUNT(*) FILTER (WHERE cancellation_reason LIKE '%instructor%'),
    'weather_cancellations', COUNT(*) FILTER (WHERE cancellation_reason LIKE '%weather%'),
    'total_refund_amount', COALESCE(SUM(
      CASE WHEN r.payment_status = 'refunded' 
      THEN co.price ELSE 0 END
    ), 0),
    'affected_customers', COUNT(DISTINCT r.customer_id)
  ) INTO v_result
  FROM registrations r
  JOIN class_occurrences co ON r.occurrence_id = co.id
  WHERE r.org_id = p_org_id
    AND r.status = 'cancelled'
    AND r.cancelled_at BETWEEN p_start_date AND p_end_date;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== CREATE MISSING TABLES ====================

-- Wallet transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid REFERENCES wallets(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  org_id uuid REFERENCES orgs(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('credit', 'debit')),
  amount decimal NOT NULL CHECK (amount > 0),
  balance_after decimal NOT NULL,
  reason text NOT NULL,
  reference_type text CHECK (reference_type IN ('booking', 'cancellation', 'refund', 'purchase', 'adjustment')),
  reference_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_customer_id ON wallet_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_org_id ON wallet_transactions(org_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at);

-- Enable RLS
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wallet_transactions
CREATE POLICY "Users can view their own wallet transactions" ON wallet_transactions
  FOR SELECT USING (
    auth.uid() = customer_id OR
    EXISTS (
      SELECT 1 FROM org_users ou 
      WHERE ou.user_id = auth.uid() 
      AND ou.org_id = wallet_transactions.org_id 
      AND ou.role IN ('owner', 'manager', 'accountant')
    )
  );

CREATE POLICY "System can insert wallet transactions" ON wallet_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM org_users ou 
      WHERE ou.user_id = auth.uid() 
      AND ou.org_id = wallet_transactions.org_id 
      AND ou.role IN ('owner', 'manager', 'front_desk')
    )
  );

-- Update function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_wallet_transactions_updated_at 
  BEFORE UPDATE ON wallet_transactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION add_wallet_credit TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_wallet_credit TO authenticated;
GRANT EXECUTE ON FUNCTION create_booking_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION use_pass_credit TO authenticated;
GRANT EXECUTE ON FUNCTION refund_pass_credit TO authenticated;
GRANT EXECUTE ON FUNCTION get_booking_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_cancellation_analytics TO authenticated;