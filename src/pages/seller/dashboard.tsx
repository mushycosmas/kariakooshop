// pages/seller/dashboard.tsx
"use client"
import SellerDashboardLayout from '../../components/SellerDashboardLayout';

const Page = () => {
  return (
    <SellerDashboardLayout>
      <div>
        <h2 className="fs-4 fw-bold mb-3">Dashboard Overview</h2>
        <p>Welcome to your seller dashboard. You can manage products, orders, and more here.</p>
      </div>
    </SellerDashboardLayout>
  );
};

export default Page;
