"use client";

import React, { useEffect, useState } from "react";
import { Container, Row, Col, Offcanvas, Button } from "react-bootstrap";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SellerSidebar from "./partial/SellerSidebar";
import Header from "./partial/Header";
import Footer from "./partial/Footer";

const SellerDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [showSidebar, setShowSidebar] = useState(false);

  const isAuthenticated = status === "authenticated";
  const username = session?.user?.name || session?.user?.email || "Guest";

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/");
    }
  }, [session, status, router]);

  if (!isAuthenticated) {
    return <p className="text-center mt-5">Redirecting to Home...</p>;
  }

  return (
    <Container fluid className="min-vh-100 bg-light p-0">
      <Row className="g-0">

        {/* 🔥 DESKTOP SIDEBAR */}
        <Col
          md={2}
          className="bg-white border-end d-none d-md-block"
          style={{ minHeight: "100vh" }}
        >
          <SellerSidebar />
        </Col>

        {/* 🔥 MOBILE SIDEBAR (OFFCANVAS) */}
        <Offcanvas
          show={showSidebar}
          onHide={() => setShowSidebar(false)}
          placement="start"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <SellerSidebar />
          </Offcanvas.Body>
        </Offcanvas>

        {/* 🔥 MAIN CONTENT */}
        <Col xs={12} md={10} className="d-flex flex-column">

          {/* HEADER */}
          <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom bg-white">

            {/* Mobile menu button */}
            <Button
              variant="outline-primary"
              className="d-md-none"
              onClick={() => setShowSidebar(true)}
            >
              ☰
            </Button>

            <div className="flex-grow-1">
              <Header isAuthenticated={isAuthenticated} username={username} />
            </div>
          </div>

          {/* CONTENT */}
          <main
            className="flex-grow-1"
            style={{
              padding: "1rem",
            }}
          >
            {children}
          </main>

          {/* FOOTER */}
          <div className="mt-auto">
            {/* <Footer /> */}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SellerDashboardLayout;