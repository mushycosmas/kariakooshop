"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Nav } from 'react-bootstrap';
import {
  FaBoxOpen,
  FaClipboardList,
  FaPlus,
  FaSignOutAlt,
  FaUserCog,
  FaTachometerAlt,
  FaEnvelope,
} from 'react-icons/fa';

const navLinks = [
  { href: '/seller/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
  { href: '/seller/product-list', label: 'My Products', icon: <FaBoxOpen /> },
  { href: '/seller/new-add', label: 'Add Product', icon: <FaPlus /> },
  { href: '/seller/messages', label: 'Messages', icon: <FaEnvelope /> },
  { href: '/seller/settings', label: 'Settings', icon: <FaUserCog /> },
  { href: '/logout', label: 'Logout', icon: <FaSignOutAlt /> },
];

const SellerSidebar = () => {
  const pathname = usePathname() ?? ""; // ensures it's always a string

  return (
    <div className="d-flex flex-column vh-100 border-end bg-white p-3">
      <h4 className="text-center text-primary mb-4">Seller Panel</h4>

      <Nav className="flex-column">
        {navLinks.map((link) => (
          <Nav.Item key={link.href}>
            <Link
              href={link.href}
              className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${
                pathname.startsWith(link.href)
                  ? 'bg-primary text-white fw-bold'
                  : 'text-dark'
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          </Nav.Item>
        ))}
      </Nav>
    </div>
  );
};

export default SellerSidebar;
