export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  condition: string;
  seller: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  productCount: number;
}

export interface HeroBanner {
  title: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
} 