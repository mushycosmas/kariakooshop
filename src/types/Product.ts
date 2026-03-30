export interface Product {
  id: number;
  slug: string;

  // 🔥 BASIC
  name: string;
  description?: string;
  location: string;
  status?: 'active' | 'inactive';

  // 🔥 PRICING
  price: number; // lowest price (auto computed)
  retail_price?: number;
  min_order_qty?: number;

  // 🔥 WHOLESALE
  wholesale_tiers?: {
    id?: number;
    ad_id?: number;
    min_qty: number;
    max_qty: number;
    whole_seller_price: number;
  }[];

  // 🔥 META
  viewed: number;
  created_at?: string;
  updated_at?: string;

  // 🔥 IMAGES
  images?: {
    id: number;
    ad_id: number;
    path: string;
  }[];

  // 🔥 CATEGORY
  category?: {
    id?: number;
    name: string;
    slug: string;
  };

  subcategory?: {
    id?: number;
    name: string;
    slug: string;
  };

  // 🔥 SELLER / USER
  user?: {
    id?: number;
    name?: string;
    avatar_url?: string;
    phone?: string;
    email?: string;

    // 🔥 EXTRA TRUST SIGNALS (VERY IMPORTANT FOR TANZANIA MARKET)
    is_verified?: boolean;
    shop_name?: string;
  };
}