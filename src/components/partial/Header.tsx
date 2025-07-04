'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import {
  BsPlusSquare,
  BsHeart,
  BsChatDots,
  BsBell,
  BsPerson,
  BsGear,
  BsSpeedometer2,
  BsBoxArrowRight,
  BsPersonCircle
} from 'react-icons/bs';

interface HeaderProps {
  isAuthenticated: boolean;
  username?: string;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, username }) => {
  const router = useRouter();

  const handleLogout = () => {
    console.log('Logging out...');
    router.push('/login'); // Replace with actual logout logic
  };

  return (
    <Navbar expand="lg" sticky="top" className="shadow-sm" style={{ backgroundColor: '#28a745' }}>
      <Container fluid>
        {/* Brand */}
        <Link href="/" className="navbar-brand fw-bold text-white">
          KariakooPlus
        </Link>

        <Navbar.Toggle aria-controls="navbarNav" />
        <Navbar.Collapse id="navbarNav">
          <Nav className="ms-auto">
            {!isAuthenticated ? (
              <>
                <Link href="/login" className="nav-link text-white">
                  Login
                </Link>
                <Link href="/register" className="nav-link text-white">
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link href="/seller/new-add" className="nav-link text-white">
                  <BsPlusSquare /> Sell
                </Link>
                {/* <Link href="/saved" className="nav-link text-white">
                  <BsHeart /> Saved
                </Link> */}
                <Link href="/seller/messages" className="nav-link text-white">
                  <BsChatDots /> Messages
                </Link>
                <Link href="/notifications" className="nav-link text-white position-relative">
                  <BsBell /> Notifications
                  <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
                    3
                    <span className="visually-hidden">unread notifications</span>
                  </Badge>
                </Link>

                <NavDropdown
                  title={
                    <>
                      <BsPersonCircle className="me-1" /> {username}
                    </>
                  }
                  id="navbarDropdown"
                  align="end"
                >
                  <Link href="/seller/settings" className="dropdown-item">
                    <BsPerson /> My Profile
                  </Link>
                  {/* <Link href="/settings" className="dropdown-item">
                    <BsGear /> Settings
                  </Link> */}
                  <Link href="/seller/dashboard" className="dropdown-item">
                    <BsSpeedometer2 /> Dashboard
                  </Link>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as="button" onClick={handleLogout}>
                    <BsBoxArrowRight /> Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
