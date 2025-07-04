// components/layouts/SellerDashboardLayout.tsx
"use client";

import React from 'react';
import { Container, Row, Col, Navbar, Image } from 'react-bootstrap';
import SellerSidebar from './partial/SellerSidebar';
import Header from './partial/Header';
import Footer from './partial/Footer';
const SellerDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Container fluid className="min-vh-100 bg-light">
      <Row>
        {/* Sidebar */}
        <Col md={2} className="bg-white border-end p-0">
                <SellerSidebar/>
        </Col>

        {/* Main Content */}
        <Col md={10} className="p-0">
          {/* Header */}
            <Header isAuthenticated={false} username="John Doe" />
          {/* Page Content */}
          <main className="p-4">{children}</main>
        </Col>
         <Footer/>
      </Row>
   
    </Container>
  );
};

export default SellerDashboardLayout;
