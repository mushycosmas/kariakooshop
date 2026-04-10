'use client';

import React from 'react';
import {
  Container,
  InputGroup,
  Form,
  Button,
  Row,
  Col,
} from 'react-bootstrap';

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <section
      className="text-center position-relative w-100"
      style={{
        background: 'linear-gradient(135deg, #1e7e34, #28a745)',
        borderBottomLeftRadius: '30px',
        borderBottomRightRadius: '30px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      }}
    >
      <div className="py-5 px-3">
        <Container fluid>

          {/* 🔥 BRAND */}
          <h1 className="text-white fw-bold mb-2">
            NONO Marketplace
          </h1>

          {/* 🔥 CORE MESSAGE */}
          <p className="text-warning fs-5 fw-semibold mb-3">
            Buy Retail or Order in Bulk — Trusted Electronics Supplier in Tanzania
          </p>

          {/* 🔥 SUB MESSAGE */}
          <p className="text-light mb-4" style={{ opacity: 0.9 }}>
            Shop single items or buy in wholesale (jumla) and grow your business with NONO.
          </p>

          {/* 🔍 SEARCH */}
          <div className="mx-auto mb-4" style={{ maxWidth: '600px' }}>
            <InputGroup className="shadow rounded-pill overflow-hidden">
              <Form.Control
                type="text"
                placeholder="Search chargers, earbuds, power banks, wholesale deals..."
                className="border-0 px-4 py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="dark" className="px-4">
                <i className="bi bi-search" />
              </Button>
            </InputGroup>
          </div>

          {/* 🔥 CTA BUTTONS (IMPORTANT) */}
          {/* <Row className="justify-content-center g-2">
            <Col xs="auto">
              <Button
                variant="warning"
                className="fw-semibold px-4"
              >
                🛒 Shop Retail
              </Button>
            </Col>

            <Col xs="auto">
              <Button
                variant="outline-light"
                className="fw-semibold px-4"
              >
                📦 Buy Wholesale
              </Button>
            </Col>
          </Row> */}

          {/* 🔥 TRUST MESSAGE */}
          <div className="mt-3">
            <small className="text-light" style={{ opacity: 0.85 }}>
              ✔ Fast Delivery • ✔ Bulk Discounts • ✔ Trusted by Resellers
            </small>
          </div>

        </Container>
      </div>
    </section>
  );
};

export default HeroSection;