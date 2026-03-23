'use client';

import React from 'react';
import {
  Container,
  InputGroup,
  Form,
  Button,
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

          {/* 🔥 BRAND FOCUSED */}
          <h1
            className="text-white fw-bold mb-2"
            style={{ letterSpacing: '1px' }}
          >
            Nono Online Shop
          </h1>

          {/* 🔥 CLEAR VALUE */}
          <p
            className="text-warning fs-5 fw-semibold mb-4"
            style={{ opacity: 0.95 }}
          >
            Buy & Sell Products in Tanzania — Fast, Easy, and Reliable
          </p>

          {/* 🔍 SEARCH */}
          <div
            className="position-relative mx-auto"
            style={{ maxWidth: '600px' }}
          >
            <InputGroup
              className="shadow rounded-pill overflow-hidden"
              style={{
                background: '#fff',
                transition: 'all 0.3s ease',
              }}
            >
              <Form.Control
                type="text"
                placeholder="Search phones, laptops, fashion, accessories..."
                className="border-0 px-4 py-2"
                style={{
                  boxShadow: 'none',
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                variant="dark"
                className="px-4"
                style={{
                  borderRadius: '0',
                }}
                disabled
              >
                <i className="bi bi-search" />
              </Button>
            </InputGroup>
          </div>

          {/* 🔥 BRAND MESSAGE */}
          <div className="mt-3">
            <small
              className="text-light"
              style={{ opacity: 0.85 }}
            >
              Nono is your trusted online marketplace for everyday shopping.
            </small>
          </div>

        </Container>
      </div>
    </section>
  );
};

export default HeroSection;