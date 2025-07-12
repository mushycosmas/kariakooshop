"use client";

import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useSession } from "next-auth/react";
import SellerSidebar from "./partial/SellerSidebar";
import Header from "./partial/Header";
import Footer from "./partial/Footer";

const SellerDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  // Getting the session from NextAuth
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated"; // Checking if the user is authenticated
  const username = session?.user?.name || session?.user?.email || "Guest"; // Displaying username or email

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
