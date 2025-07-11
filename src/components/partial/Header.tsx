'use client';

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
import { useSession, signOut } from 'next-auth/react';

const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Sign out using next-auth
      await signOut({ redirect: false });
      // Redirect manually after sign out
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isAuthenticated = status === 'authenticated';
  const username = session?.user?.name || session?.user?.email || 'User';

  return (
    <Navbar
      expand="lg"
      sticky="top"
      className="shadow-sm"
      style={{ backgroundColor: '#28a745' }}
    >
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
                {/* You can add public links here */}
                {/* <Link href="/login" className="nav-link text-white">Login</Link> */}
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
