export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  size: string;
  condition: string;
  designer: string;
  images: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface ProductDetail {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  size: string;
  condition: string;
  designer: string;
  images: string[]; // Array of image URLs for detail view
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  created_at: string;
  updated_at?: string;
  is_favorite?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
