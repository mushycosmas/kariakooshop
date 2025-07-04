'use client';

import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import {
  BsHouseDoorFill,
  BsEnvelopeFill,
  BsPhoneFill,
  BsWhatsapp,
  BsFacebook,
  BsTwitter,
  BsInstagram,
  BsYoutube,
} from 'react-icons/bs';
import Link from 'next/link';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light pt-5 pb-4 mt-5">
      <Container>
        <Row>
          {/* About */}
          <Col md={3} lg={3} xl={3} className="mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-warning">
              Kariakoo Plus Online Shop
            </h5>
            <p>
              Shop the best deals on electronics, accessories, computers, radios, and bags.
              Fast delivery and secure shopping experience right from the heart of Kariakoo.
            </p>
          </Col>

          {/* Quick Links */}
          <Col md={2} lg={2} xl={2} className="mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-warning">Quick Links</h5>
            <p><Link href="/" className="text-light text-decoration-none">Home</Link></p>
            <p><Link href="/products" className="text-light text-decoration-none">Shop</Link></p>
            <p><Link href="/about" className="text-light text-decoration-none">About Us</Link></p>
            {/* <p><Link href="/contact" className="text-light text-decoration-none">Contact</Link></p> */}
          </Col>

          {/* Contact Info */}
          <Col md={4} lg={3} xl={3} className="mx-auto mt-3">
            <h5 className="text-uppercase mb-4 font-weight-bold text-warning">Contact</h5>
            <p className="d-flex align-items-center">
              <BsHouseDoorFill className="me-2" /> Dar es Salaam, Tanzania
            </p>
            <p className="d-flex align-items-center">
              <BsEnvelopeFill className="me-2" /> support@kariakooplus.co.tz
            </p>
            <p className="d-flex align-items-center">
              <BsPhoneFill className="me-2" /> +255 744 091 391
            </p>
            <p className="d-flex align-items-center">
              <BsWhatsapp className="me-2" /> +255 744 091 391
            </p>
          </Col>

          {/* Social Links */}
          <Col md={3} lg={4} xl={3} className="mx-auto mt-3 text-center">
            <h5 className="text-uppercase mb-4 font-weight-bold text-warning">Follow Us</h5>
            <a className="btn btn-outline-light btn-floating m-1" href="#"><BsFacebook /></a>
            <a className="btn btn-outline-light btn-floating m-1" href="#"><BsTwitter /></a>
            <a className="btn btn-outline-light btn-floating m-1" href="#"><BsInstagram /></a>
            <a className="btn btn-outline-light btn-floating m-1" href="#"><BsYoutube /></a>
          </Col>
        </Row>

        <hr className="my-3" />

        <Row className="align-items-center">
          <Col md={12} className="text-center">
            <p className="mb-0">&copy; {currentYear} KariakooPlus Online Shop. All rights reserved.</p>
            <small>Related brands: <strong>kariakoomall</strong>, <strong>mykariakoo</strong></small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
