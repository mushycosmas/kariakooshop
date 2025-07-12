"use client";

import React from "react";
import { useSession, signIn } from "next-auth/react";
import GoogleOneTap from "./GoogleOneTap";
import Header from "./partial/Header";
import Footer from "./partial/Footer";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated";
  const username = session?.user?.name || session?.user?.email || "Guest";

  return (
    <div className="d-flex flex-column min-vh-100 position-relative">
      <GoogleOneTap />

      {/* Pass session props to Header */}
      <Header isAuthenticated={isAuthenticated} username={username} />

      {/* Render the page content */}
      <main className="flex-fill">{children}</main>

      <Footer />

      {/* Display login button if user is unauthenticated */}
      {status === "unauthenticated" && (
        <div
          style={{
            position: "fixed",
            top: "6rem",
            right: "1rem",
            background: "white",
            border: "1px solid #ddd",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            zIndex: 1000,
            cursor: "pointer",
          }}
          onClick={() => signIn("google")}
          title="Sign in with Google"
        >
          🔒 Login with Google
        </div>
      )}
    </div>
  );
};

export default MainLayout;
