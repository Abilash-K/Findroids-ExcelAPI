-- Drop existing function if it exists
DROP FUNCTION IF EXISTS confirm_payment;

-- Create a function to handle payment confirmation and balance update in a transaction
CREATE OR REPLACE FUNCTION confirm_payment(
  p_payment_id UUID,
  p_amount DECIMAL,
  p_account_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance DECIMAL;
  v_rows_updated INTEGER;
BEGIN
  -- Start transaction explicitly
  BEGIN
    -- Lock the account row for update and get current balance
    SELECT balance INTO v_current_balance
    FROM accounts
    WHERE id = p_account_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Account not found';
    END IF;

    -- Check if we have sufficient balance
    IF v_current_balance < p_amount THEN
      RETURN FALSE;
    END IF;

    -- Update payment status first
    UPDATE payments
    SET status = 'completed',
        updated_at = NOW()
    WHERE id = p_payment_id
    AND status = 'pending';

    GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
    IF v_rows_updated = 0 THEN
      RAISE EXCEPTION 'Payment not found or already completed';
    END IF;

    -- Update account balance
    UPDATE accounts
    SET balance = balance - p_amount,
        updated_at = NOW()
    WHERE id = p_account_id
    AND balance >= p_amount;

    GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
    IF v_rows_updated = 0 THEN
      RAISE EXCEPTION 'Failed to update account balance';
    END IF;

    -- If we get here, commit the transaction
    COMMIT;
    RETURN TRUE;

  EXCEPTION WHEN OTHERS THEN
    -- On error, rollback
    ROLLBACK;
    RAISE NOTICE 'Error in confirm_payment: %', SQLERRM;
    RETURN FALSE;
  END;
END;
$$ LANGUAGE plpgsql; 