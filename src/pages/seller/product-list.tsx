// pages/seller/dashboard.tsx
"use client"
import SellerDashboardLayout from '../../components/SellerDashboardLayout';
import ProductList from '@/components/sellers/Product/ProductList';

const Page = () => {
  return (
    <SellerDashboardLayout>
      <div>
      <ProductList/>
      </div>
    </SellerDashboardLayout>
  );
};

export default Page;
