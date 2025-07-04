'use client';

import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
} from 'react-bootstrap';
import { useRouter } from 'next/navigation';
interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <section
      className="text-center position-relative w-100"
      style={{
        backgroundColor: '#28a745',
        borderBottomLeftRadius: '30px',
        borderBottomRightRadius: '30px',
      }}
    >
      <div className="py-5 px-3">
        <Container fluid>
          <h2 className="text-white display-5 fw-bold mb-2">Find Your Perfect Ad</h2>
          <p className="text-warning fs-5 fw-semibold">
            Avoid the Middleman — Deal Directly and Save More!
          </p>

          <div className="position-relative mx-auto" style={{ maxWidth: '600px' }}>
            <InputGroup className="shadow-sm rounded">
              <Form.Control
                type="text"
                placeholder="Search for ads..."
                className="rounded-start"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="dark" className="rounded-end" disabled>
                <i className="bi bi-search" />
              </Button>
            </InputGroup>
          </div>
        </Container>
      </div>
    </section>
  );
};

export default HeroSection;
