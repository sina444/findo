export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  category: string;
  image: string;
  images: string[];
  description: string;
  shortDescription: string;
  specifications: { label: string; value: string }[];
  careInstructions: string[];
  inStock: boolean;
  badge?: string;
  features: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  date: string;
  readTime: string;
}

export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  location: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}
