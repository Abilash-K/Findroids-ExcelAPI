-- Drop existing function if it exists
DROP FUNCTION IF EXISTS confirm_payment;

-- Create a function to handle payment confirmation and balance update in a transaction
CREATE OR REPLACE FUNCTION confirm_payment(
  p_payment_id UUID,
  p_amount NUMERIC,
  p_account_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
  v_payment_record RECORD;
  v_account_record RECORD;
BEGIN
  -- Debug log
  RAISE NOTICE 'Starting confirm_payment with payment_id: %, account_id: %, amount: %', p_payment_id, p_account_id, p_amount;

  -- First verify the payment exists and is pending, and lock it
  SELECT * INTO v_payment_record
  FROM payments
  WHERE id = p_payment_id
  AND status = 'pending'
  FOR UPDATE;

  IF v_payment_record IS NULL THEN
    RAISE NOTICE 'Payment not found or not pending: %', p_payment_id;
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Payment not found or not in pending status'
    );
  END IF;

  -- Debug log
  RAISE NOTICE 'Found payment record: %', to_json(v_payment_record);

  -- Get and lock account record
  SELECT * INTO v_account_record
  FROM accounts
  WHERE id = p_account_id
  FOR UPDATE;

  -- Debug log
  RAISE NOTICE 'Account lookup result: %', to_json(v_account_record);

  IF v_account_record IS NULL THEN
    RAISE NOTICE 'Account not found with ID: %', p_account_id;
    RETURN jsonb_build_object(
      'success', false,
      'message', format('Account not found. ID: %s', p_account_id::text)
    );
  END IF;

  -- Store current balance
  v_current_balance := v_account_record.balance;

  -- Debug log
  RAISE NOTICE 'Current balance: %, Required amount: %', v_current_balance, p_amount;

  -- Check if we have sufficient balance
  IF v_current_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', format('Insufficient balance. Current: %s, Required: %s', v_current_balance, p_amount)
    );
  END IF;

  -- Update payment status
  UPDATE payments
  SET status = 'completed',
      updated_at = NOW()
  WHERE id = p_payment_id;

  -- Debug log
  RAISE NOTICE 'Updated payment status to completed';

  -- Update account balance
  UPDATE accounts
  SET balance = balance - p_amount,
      updated_at = NOW()
  WHERE id = p_account_id
  RETURNING balance INTO v_new_balance;

  -- Debug log
  RAISE NOTICE 'Updated balance from % to %', v_current_balance, v_new_balance;

  IF v_new_balance IS NULL OR v_new_balance = v_current_balance THEN
    RAISE NOTICE 'Failed to update balance';
    RETURN jsonb_build_object(
      'success', false,
      'message', format('Failed to update balance. Old: %s, New: %s', v_current_balance, v_new_balance)
    );
  END IF;

  -- Return success with detailed information
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Payment confirmed successfully',
    'data', jsonb_build_object(
      'payment_id', p_payment_id,
      'account_id', p_account_id,
      'previous_balance', v_current_balance,
      'new_balance', v_new_balance,
      'amount', p_amount
    )
  );

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in confirm_payment: %', SQLERRM;
  RETURN jsonb_build_object(
    'success', false,
    'message', format('Error: %s. Payment ID: %s, Account ID: %s', SQLERRM, p_payment_id::text, p_account_id::text)
  );
END;
$$ LANGUAGE plpgsql; 