export interface Seller {
  id?: number;
  name?: string;
  avatar?: string;
  phone?: string;
  email?: string;
}

export interface Product {
  id: number;
  slug: string;               // <-- add this line
  name: string;
  price: number;
  product_description?: string;
  // ... other fields
  seller?: Seller;
}
