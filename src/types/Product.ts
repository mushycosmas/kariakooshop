export interface Product {
  id: number;
  slug: string;
  name: string;
  price: number;
  description?: string;
  location:string;
  created_at?: string;
  images?: { id: number; ad_id: number; path: string }[];
  category?: { name: string; slug: string };
  subcategory?: { name: string; slug: string };
  user?: {
    id?: number;
    name?: string;
    avatar_url?: string;
    phone?: string;
    email?: string;
  };
}
