export interface Seller {
  id?: number;
  name?: string;
  avatar?: string;
  phone?: string;
  email?: string;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  price: number;
  product_description?: string;
  user?: {
    id?: number;
    name?: string;
    avatar_url?: string;
    phone?: string;
    email?: string;
  };
}
