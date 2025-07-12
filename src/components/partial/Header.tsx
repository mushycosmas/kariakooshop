"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import {
  BsPlusSquare,
  BsChatDots,
  BsPerson,
  BsSpeedometer2,
  BsBoxArrowRight,
  BsPersonCircle,
} from 'react-icons/bs';
import { signOut } from 'next-auth/react';

// ✅ Add props type
interface HeaderProps {
  isAuthenticated: boolean;
  username: string;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, username }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Navbar
      expand="lg"
      sticky="top"
      className="shadow-sm"
      style={{ backgroundColor: '#28a745' }}
    >
      <Container fluid>
        <Link href="/" className="navbar-brand fw-bold text-white">
          KariakooPlus
        </Link>

        <Navbar.Toggle aria-controls="navbarNav" />
        <Navbar.Collapse id="navbarNav">
          <Nav className="ms-auto">
            {!isAuthenticated ? (
              <>
                {/* Add public links here if needed */}
              </>
            ) : (
              <>
                <Link href="/seller/new-add" className="nav-link text-white">
                  <BsPlusSquare /> Sell
                </Link>
                <Link href="/seller/messages" className="nav-link text-white">
                  <BsChatDots /> Messages
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
