// /data/data.js
export const categories = [
  { id: 1, name: 'Mobile Phones' },
  { id: 2, name: 'Laptops' },
  { id: 3, name: 'Cameras' },
];

export const subcategories = [
  { id: 1, category_id: 1, name: 'Smartphones' },
  { id: 2, category_id: 1, name: 'Feature Phones' },
  { id: 3, category_id: 2, name: 'Gaming Laptops' },
  { id: 4, category_id: 2, name: 'Business Laptops' },
  { id: 5, category_id: 3, name: 'DSLR' },
  { id: 6, category_id: 3, name: 'Mirrorless' },
];

export const brands = [
  { id: 1, name: 'Apple' },
  { id: 2, name: 'Samsung' },
  { id: 3, name: 'Dell' },
  { id: 4, name: 'Canon' },
];

export const models = [
  { id: 1, brand_id: 1, name: 'iPhone 13' },
  { id: 2, brand_id: 2, name: 'Samsung Galaxy S21' },
  { id: 3, brand_id: 3, name: 'Dell XPS 13' },
  { id: 4, brand_id: 4, name: 'Canon EOS 5D' },
];
