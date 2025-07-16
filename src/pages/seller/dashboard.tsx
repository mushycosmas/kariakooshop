"use client";

import React, { useEffect } from "react";
import SellerDashboardLayout from "../../components/SellerDashboardLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Page = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Wait for session to load

    if (status === "unauthenticated") {
      // If the user is not authenticated, redirect to the login page
      router.push("/login");
    }
  }, [status, router]);

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
