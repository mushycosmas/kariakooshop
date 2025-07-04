"use client";

import React from "react";
import { useSession, signIn } from "next-auth/react";
import GoogleOneTap from "./GoogleOneTap"; // Adjust path if needed
import Header from "./partial/Header";
import Footer from "./partial/Footer";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();

  return (
    <div className="d-flex flex-column min-vh-100 position-relative">
      <GoogleOneTap />

      <Header isAuthenticated={!!session} username={session?.user?.name || "Guest"} />

      <main className="flex-fill">{children}</main>

      <Footer />

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
