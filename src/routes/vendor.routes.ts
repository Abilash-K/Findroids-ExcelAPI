import { Router } from 'express';
import supabase from '../config/supabase';
import logger from '../utils/logger';
import {
  VendorResponse,
  AccountResponse,
  PaymentResponse,
  CreateVendorRequest,
  UpdateVendorRequest,
  CreatePaymentRequest,
  UpdatePaymentRequest
} from '../types/vendor.types';

const router = Router();

// Get all vendors
router.get('/vendors', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      message: 'Vendors retrieved successfully',
      data: { vendors: data }
    } as VendorResponse);
  } catch (error) {
    logger.error('Error fetching vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendors'
    } as VendorResponse);
  }
});

// Create a new vendor
router.post('/vendors', async (req, res) => {
  try {
    const vendorData: CreateVendorRequest = req.body;

    const { data, error } = await supabase
      .from('vendors')
      .insert([vendorData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      data: { vendor: data }
    } as VendorResponse);
  } catch (error) {
    logger.error('Error creating vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating vendor'
    } as VendorResponse);
  }
});

// Update a vendor
router.put('/vendors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vendorData: UpdateVendorRequest = req.body;

    const { data, error } = await supabase
      .from('vendors')
      .update(vendorData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Vendor updated successfully',
      data: { vendor: data }
    } as VendorResponse);
  } catch (error) {
    logger.error('Error updating vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating vendor'
    } as VendorResponse);
  }
});

// Delete a vendor
router.delete('/vendors/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Vendor deleted successfully'
    } as VendorResponse);
  } catch (error) {
    logger.error('Error deleting vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting vendor'
    } as VendorResponse);
  }
});

// Get all accounts
router.get('/accounts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      message: 'Accounts retrieved successfully',
      data: { accounts: data }
    } as AccountResponse);
  } catch (error) {
    logger.error('Error fetching accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching accounts'
    } as AccountResponse);
  }
});

// Get all payments
router.get('/payments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        vendors (name),
        accounts (name)
      `)
      .order('payment_date', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      message: 'Payments retrieved successfully',
      data: { payments: data }
    } as PaymentResponse);
  } catch (error) {
    logger.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments'
    } as PaymentResponse);
  }
});

// Create a new payment
router.post('/payments', async (req, res) => {
  try {
    const paymentData: CreatePaymentRequest = req.body;

    // Check if account has sufficient balance
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', paymentData.account_id)
      .single();

    if (accountError) throw accountError;

    if (account.balance < paymentData.amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient account balance'
      } as PaymentResponse);
    }

    // Create payment and update account balance
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();

    if (error) throw error;

    // Update account balance
    const { error: updateError } = await supabase
      .from('accounts')
      .update({ balance: account.balance - paymentData.amount })
      .eq('id', paymentData.account_id);

    if (updateError) throw updateError;

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: { payment: data }
    } as PaymentResponse);
  } catch (error) {
    logger.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment'
    } as PaymentResponse);
  }
});

// Update a payment
router.put('/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const paymentData: UpdatePaymentRequest = req.body;

    const { data, error } = await supabase
      .from('payments')
      .update(paymentData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Payment updated successfully',
      data: { payment: data }
    } as PaymentResponse);
  } catch (error) {
    logger.error('Error updating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment'
    } as PaymentResponse);
  }
});

// Delete a payment
router.delete('/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get payment details to restore account balance
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (paymentError) throw paymentError;

    // Delete payment
    const { error: deleteError } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Restore account balance
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', payment.account_id)
      .single();

    if (accountError) throw accountError;

    const { error: updateError } = await supabase
      .from('accounts')
      .update({ balance: account.balance + payment.amount })
      .eq('id', payment.account_id);

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: 'Payment deleted successfully'
    } as PaymentResponse);
  } catch (error) {
    logger.error('Error deleting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting payment'
    } as PaymentResponse);
  }
});

// Confirm a payment
router.post('/payments/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;

    // Start a transaction
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (paymentError) throw paymentError;

    // Check if payment is already completed
    if (payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment is already completed'
      } as PaymentResponse);
    }

    // Check if account has sufficient balance
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', payment.account_id)
      .single();

    if (accountError) throw accountError;

    if (account.balance < payment.amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient account balance'
      } as PaymentResponse);
    }

    // Use a transaction to update both payment and account
    const { data: result, error: transactionError } = await supabase.rpc('confirm_payment', {
      p_payment_id: id,
      p_amount: payment.amount,
      p_account_id: payment.account_id
    });

    if (transactionError) throw transactionError;

    // Get the updated payment
    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: { payment: updatedPayment }
    } as PaymentResponse);
  } catch (error) {
    logger.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment'
    } as PaymentResponse);
  }
});

// Generate account status report
router.get('/report', async (req, res) => {
  try {
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select(`
        *,
        vendors (name),
        accounts (name)
      `)
      .order('payment_date', { ascending: false });

    if (paymentsError) throw paymentsError;

    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*');

    if (accountsError) throw accountsError;

    res.json({
      success: true,
      message: 'Report generated successfully',
      data: {
        payments,
        accounts,
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating report'
    });
  }
});

export default router; 