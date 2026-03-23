"use client";

import React, { useEffect, useState } from "react";
import SellerDashboardLayout from "../../components/SellerDashboardLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, Row, Col } from "react-bootstrap";
import { FaBoxOpen, FaEye, FaEnvelope } from "react-icons/fa";

const Page = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState({
    totalAds: 0,
    totalViews: 0,
    totalMessages: 0,
  });

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // TODO: Replace with real API call
  useEffect(() => {
    // Example: fetch stats from your API
    // fetch("/api/seller/stats").then(res => res.json()).then(setStats);

    // Temporary demo data
    setStats({
      totalAds: 12,
      totalViews: 345,
      totalMessages: 18,
    });
  }, []);

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
                  <h4 className="fw-bold">{stats.totalAds}</h4>
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
                  <h4 className="fw-bold">{stats.totalViews}</h4>
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
                  <h4 className="fw-bold">{stats.totalMessages}</h4>
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