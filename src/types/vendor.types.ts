export type PaymentScheduleType = 'weekly' | 'biweekly' | 'on_demand';

export interface Account {
  id: string;
  name: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  payment_schedule: PaymentScheduleType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  vendor_id: string;
  account_id: string;
  amount: number;
  payment_date: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface VendorResponse {
  success: boolean;
  message: string;
  data?: {
    vendor?: Vendor;
    vendors?: Vendor[];
  };
}

export interface AccountResponse {
  success: boolean;
  message: string;
  data?: {
    account?: Account;
    accounts?: Account[];
  };
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data?: {
    payment?: Payment;
    payments?: Payment[];
  };
}

export interface CreateVendorRequest {
  name: string;
  payment_schedule: PaymentScheduleType;
}

export interface UpdateVendorRequest {
  name?: string;
  payment_schedule?: PaymentScheduleType;
  is_active?: boolean;
}

export interface CreatePaymentRequest {
  vendor_id: string;
  account_id: string;
  amount: number;
  payment_date: string;
}

export interface UpdatePaymentRequest {
  amount?: number;
  payment_date?: string;
  status?: 'pending' | 'completed' | 'cancelled';
} 