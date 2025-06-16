// Chat model interface
export interface Chat {
  id: number;
  buyer_id: number;
  seller_id: number;
  product_id: number;
  buyer_read_at: string | null;
  seller_read_at: string | null;
  created_at: string;
  updated_at: string;
  buyer?: User;
  seller?: User;
  product?: Product;
  lastMessage?: Message;
  messages?: Message[];
}

// Message model interface
export interface Message {
  id: number;
  chat_id: number;
  user_id: number;
  content: string;
  type: 'text' | 'offer' | 'offer_response' | 'payment';
  offer_id?: number;
  created_at: string;
  updated_at: string;
  user?: User;
  offer?: Offer;
}

// Offer model interface
export interface Offer {
  id: number;
  chat_id: number;
  buyer_id: number;
  seller_id: number;
  product_id: number;
  amount: number;
  currency: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'paid' | 'cancelled';
  created_at: string;
  updated_at: string;
  buyer?: User;
  seller?: User;
  product?: Product;
}

// Payment model interface
export interface Payment {
  id: number;
  offer_id: number;
  buyer_id: number;
  seller_id: number;
  product_id: number;
  user_id: number;
  amount: number;
  currency: string;
  payment_method: 'visa' | 'debit' | 'apple_pay' | 'paypal';
  payment_provider?: string;
  provider_payment_id?: string;
  provider_intent_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  transaction_id: string;
  paid_at: string | null;
  completed_at?: string | null;
  refunded_at?: string | null;
  metadata?: any;
  shipping_address?: any;
  created_at: string;
  updated_at: string;
  offer?: Offer;
}

// User model interface (simplified for chat purposes)
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  avatar_url?: string;
}

// Product model interface (simplified for chat purposes)
export interface Product {
  id: number;
  name: string;
  price: number;
  image_url?: string;
}
