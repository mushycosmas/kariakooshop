"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import SellerDashboardLayout from "../../components/SellerDashboardLayout";

const Page = () => {
  const { data: session, status } = useSession(); // Get session from NextAuth
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Wait until session is checked

    if (!session) {
      // Redirect user to login page if not authenticated
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // While session is being checked or user is not logged in, we can display a loading indicator
  if (status === "loading") {
    return <div>Loading...</div>;
  }

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
