"use client";

import React, { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // Next 13 app directory navigation
import SellerSidebar from "./partial/SellerSidebar";
import Header from "./partial/Header";
import Footer from "./partial/Footer";

const SellerDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAuthenticated = status === "authenticated";
  const username = session?.user?.name || session?.user?.email || "Guest";

  useEffect(() => {
    if (status === "loading") return; // wait for session status to resolve

    if (!session) {
      // Not authenticated — redirect to home page
      router.push('/');
    }
  }, [session, status, router]);

  if (!isAuthenticated) {
    // Optionally show a loading or redirect message while redirecting
    return <p>Redirecting to Home...</p>;
  }

  return (
    <Container fluid className="min-vh-100 bg-light">
      <Row>
        {/* Sidebar */}
        <Col md={2} className="bg-white border-end p-0">
          <SellerSidebar />
        </Col>

        {/* Main Content */}
        <Col md={10} className="p-0">
          {/* Header */}
          <Header isAuthenticated={isAuthenticated} username={username} />

          {/* Page Content */}
          <main className="p-4">{children}</main>
        </Col>

        {/* Footer */}
        <Footer />
      </Row>
    </Container>
  );
};

export default SellerDashboardLayout;
