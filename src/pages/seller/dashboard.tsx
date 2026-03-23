"use client";

import React, { useEffect, useState } from "react";
import SellerDashboardLayout from "../../components/SellerDashboardLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, Row, Col } from "react-bootstrap";
import { FaBoxOpen, FaEye, FaEnvelope } from "react-icons/fa";

type Stats = {
  totalAds: number;
  totalViews: number;
  totalMessages: number;
};

const Page = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<Stats>({
    totalAds: 0,
    totalViews: 0,
    totalMessages: 0,
  });

  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch real stats from API
  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user?.id) return;
      

      try {
        setLoading(true);
        const res = await fetch(`/api/seller/stats?sellerId=${session.user.id}`);
        if (!res.ok) throw new Error("Failed to fetch stats");

        const data: Stats = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [session?.user?.id]);

  return (
    <SellerDashboardLayout>
      <div className="container-fluid">
        {/* Page Header */}
        <div className="mb-4">
          <h2 className="fw-bold">Dashboard Overview</h2>
          <p className="text-muted">
            Welcome back, {session?.user?.name || "Seller"} 👋 Here’s a quick summary of your ads performance.
          </p>
        </div>

        {/* Stats Cards */}
        <Row className="g-4">
          <Col md={4}>
            <Card className="shadow-sm border-0 rounded-4">
              <Card.Body className="d-flex align-items-center gap-3">
                <FaBoxOpen size={30} className="text-primary" />
                <div>
                  <h6 className="mb-0 text-muted">Ads Posted</h6>
                  <h4 className="fw-bold">{loading ? "..." : stats.totalAds}</h4>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="shadow-sm border-0 rounded-4">
              <Card.Body className="d-flex align-items-center gap-3">
                <FaEye size={30} className="text-success" />
                <div>
                  <h6 className="mb-0 text-muted">Total Views</h6>
                  <h4 className="fw-bold">{loading ? "..." : stats.totalViews}</h4>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="shadow-sm border-0 rounded-4">
              <Card.Body className="d-flex align-items-center gap-3">
                <FaEnvelope size={30} className="text-warning" />
                <div>
                  <h6 className="mb-0 text-muted">Messages</h6>
                  <h4 className="fw-bold">{loading ? "..." : stats.totalMessages}</h4>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </SellerDashboardLayout>
  );
};

export default Page;