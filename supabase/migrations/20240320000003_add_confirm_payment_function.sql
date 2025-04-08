-- Create a function to handle payment confirmation and balance update in a transaction
CREATE OR REPLACE FUNCTION confirm_payment(
  p_payment_id UUID,
  p_amount DECIMAL,
  p_account_id UUID
) RETURNS void AS $$
BEGIN
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
END;
$$ LANGUAGE plpgsql; 