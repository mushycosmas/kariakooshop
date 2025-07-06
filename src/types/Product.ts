// types/Product.ts

export interface Seller {
  id?: number;
  name?: string;
  avatar?: string;
  phone?: string;
  email?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  product_description?: string;
  // ...other existing product fields

  seller?: Seller;
}
