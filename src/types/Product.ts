// types/Product.ts

export interface Product {
  id: number;
  name: string;
  price: number;
  slug: string;
  imageUrl?: string;
  location: string;
  postedTime: string;
  description: string;
}
