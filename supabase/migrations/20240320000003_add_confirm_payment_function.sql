-- Drop existing function if it exists
DROP FUNCTION IF EXISTS confirm_payment;

-- Create a function to handle payment confirmation and balance update in a transaction
CREATE OR REPLACE FUNCTION confirm_payment(
  p_payment_id UUID,
  p_amount DECIMAL,
  p_account_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_current_balance DECIMAL;
  v_new_balance DECIMAL;
  v_rows_updated INTEGER;
  v_result JSONB;
BEGIN
  -- Lock the account row for update and get current balance
  SELECT balance INTO v_current_balance
  FROM accounts
  WHERE id = p_account_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Account not found'
    );
  END IF;

  -- Check if we have sufficient balance
  IF v_current_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', format('Insufficient balance. Current: %s, Required: %s', v_current_balance, p_amount)
    );
  END IF;

  -- Update payment status first
  UPDATE payments
  SET status = 'completed',
      updated_at = NOW()
  WHERE id = p_payment_id
  AND status = 'pending'
  RETURNING id INTO v_rows_updated;

  IF v_rows_updated IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Payment not found or already completed'
    );
  END IF;

  -- Update account balance and get the new balance
  UPDATE accounts
  SET balance = balance - p_amount,
      updated_at = NOW()
  WHERE id = p_account_id
  RETURNING balance INTO v_new_balance;

  IF v_new_balance IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Failed to update account balance'
    );
  END IF;

  -- Verify the balance was actually updated
  IF v_new_balance = v_current_balance THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Balance update failed - no change in balance'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Payment confirmed successfully',
    'data', jsonb_build_object(
      'previous_balance', v_current_balance,
      'new_balance', v_new_balance,
      'amount', p_amount
    )
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', SQLERRM
  );
END;
$$ LANGUAGE plpgsql; 