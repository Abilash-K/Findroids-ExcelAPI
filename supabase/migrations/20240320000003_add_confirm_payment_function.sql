-- Create a function to handle payment confirmation and balance update in a transaction
CREATE OR REPLACE FUNCTION confirm_payment(
  p_payment_id UUID,
  p_amount DECIMAL,
  p_account_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance DECIMAL;
BEGIN
  -- Start transaction explicitly
  BEGIN
    -- Lock the account row for update
    SELECT balance INTO v_current_balance
    FROM accounts
    WHERE id = p_account_id
    FOR UPDATE;

    -- Check if we have sufficient balance
    IF v_current_balance < p_amount THEN
      RETURN FALSE;
    END IF;

    -- Update payment status
    UPDATE payments
    SET status = 'completed',
        updated_at = NOW()
    WHERE id = p_payment_id;

    -- Update account balance
    UPDATE accounts
    SET balance = balance - p_amount,
        updated_at = NOW()
    WHERE id = p_account_id;

    -- If we get here, commit the transaction
    RETURN TRUE;
  EXCEPTION WHEN OTHERS THEN
    -- On error, rollback
    RAISE NOTICE 'Error in confirm_payment: %', SQLERRM;
    RETURN FALSE;
  END;
END;
$$ LANGUAGE plpgsql; 