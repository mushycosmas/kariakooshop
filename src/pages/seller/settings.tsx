// pages/seller/dashboard.tsx
"use client"
import SellerDashboardLayout from '../../components/SellerDashboardLayout';
import PersonalDetailsForm from '@/components/Forms/Personal/PersonalDetailsForm';

const Setting = () => {
  return (
    <SellerDashboardLayout>
      <div>
      <PersonalDetailsForm/>
      </div>
    </SellerDashboardLayout>
  );
};

export default Setting;
