// Import existing models
import { Offer, User, Product } from './chat.model';

// Order model interfaces
export interface Order {
  id: number;
  offer_id: number;
  buyer_id: number;
  seller_id: number;
  product_id: number;
  amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: 'visa' | 'debit' | 'apple_pay' | 'paypal';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id: string;
  shipping_address: ShippingAddress;
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  estimated_delivery?: string;
  delivered_at?: string;
  offer?: Offer;
  buyer?: User;
  seller?: User;
  product?: Product;
}

// Shipping Address model
export interface ShippingAddress {
  id?: number;
  full_name: string;
  phone: string;
  street_address: string;
  apartment?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
  instructions?: string;
}

// Payment method details
export interface PaymentMethod {
  type: 'visa' | 'debit' | 'apple_pay' | 'paypal';
  card_last_four?: string;
  cardholder_name?: string;
  expiry_month?: number;
  expiry_year?: number;
  paypal_email?: string;
  apple_pay_device?: string;
}

// Payment processing request
export interface PaymentRequest {
  offer_id: number;
  payment_method: PaymentMethod;
  shipping_address: ShippingAddress;
  billing_address?: ShippingAddress;
}

// Payment processing request (alternative format)
export interface PaymentProcessRequest {
  payment_id: number;
  shipping_address: ShippingAddress;
  billing_address?: ShippingAddress;
}

// Payment response
export interface PaymentResponse {
  success: boolean;
  message: string;
  data?: {
    order: Order;
    payment_intent_id?: string;
    client_secret?: string;
  };
  errors?: any;
}

// Order status update
export interface OrderStatusUpdate {
  order_id: number;
  status: Order['status'];
  tracking_number?: string;
  notes?: string;
}

// Re-export existing models for convenience
export * from './chat.model';
