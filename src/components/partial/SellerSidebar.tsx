"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Nav } from "react-bootstrap";
import {
  FaBoxOpen,
  FaPlus,
  FaSignOutAlt,
  FaUserCog,
  FaTachometerAlt,
  FaEnvelope,
} from "react-icons/fa";
import { signOut } from "next-auth/react";

const navLinks = [
  { href: "/seller/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
  { href: "/seller/product-list", label: "My Products", icon: <FaBoxOpen /> },
  { href: "/seller/new-add", label: "Add Product", icon: <FaPlus /> },
  { href: "/seller/messages", label: "Messages", icon: <FaEnvelope /> },
  { href: "/seller/settings", label: "Settings", icon: <FaUserCog /> },
];

const SellerSidebar = () => {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut({
        redirect: false, // prevent auto redirect
      });
      router.push("/"); // redirect manually
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="d-flex flex-column vh-100 border-end bg-white p-3">
      <h4 className="text-center text-primary mb-4">Seller Panel</h4>

      {/* Navigation Links */}
      <Nav className="flex-column">
        {navLinks.map((link) => (
          <Nav.Item key={link.href}>
            <Link
              href={link.href}
              className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${
                pathname.startsWith(link.href)
                  ? "bg-primary text-white fw-bold"
                  : "text-dark"
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          </Nav.Item>
        ))}
      </Nav>

      {/* Logout Button */}
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>
  );
};

export default SellerSidebar;