import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "../../../lib/db";
import { RowDataPacket } from "mysql2";
import { getSession } from "next-auth/react"; // Import getSession

// Define the GoogleProfile interface
interface GoogleProfile {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  [key: string]: any;
}

export default NextAuth({
  // Configure Google login provider
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // Secret for JWT tokens (should be kept secure)
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt", // Store session in JWT
  },

  // Define custom callbacks
  callbacks: {
    // JWT callback to handle token creation or updates
    async jwt({ token, account, profile }) {
      if (account && profile?.email) {
        const prof = profile as GoogleProfile;
        const email = prof.email;
        const name = prof.name || "";
        const image = prof.picture || "";

        // Check if user exists in the database
        const [rows] = await db.query<RowDataPacket[]>(
          "SELECT id FROM users WHERE email = ?",
          [email]
        );

        let userId: number;

        if (rows.length === 0) {
          // If user does not exist, insert a new user record
          const [firstName, ...lastParts] = name.split(" ");
          const lastName = lastParts.join(" ");

          const [result]: any = await db.query(
            `INSERT INTO users 
              (name, user_type, first_name, last_name, location, email, password, phone, gender, birthday, address, avatar_url, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              name,
              "google", // User type set to 'google' for Google sign-ins
              firstName,
              lastName,
              null, // Location set to NULL
              email,
              "", // Password (empty as it's Google login)
              "", // Phone (empty)
              null, // Gender (empty)
              null, // Birthday (empty)
              "", // Address (empty)
              image, // Avatar URL from Google
            ]
          );

          userId = result.insertId; // Get the ID of the newly created user
        } else {
          // If user already exists, use their existing ID
          userId = rows[0].id;
        }

        // Attach user ID to the token
        token.id = userId;
      }

      return token;
    },

    // Session callback to include the user ID in the session object
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id; // Add the user ID to session
      }
      return session;
    },

    // Redirect callback to define where to send users after sign-in
    async redirect({ url, baseUrl }) {
      // Check if the user is already logged in (session exists)
      const session = await getSession();
      if (session) {
        // Always redirect logged-in users to the Home page (`/`)
        return "/";
      }

      // If the user is not logged in, redirect them to the home page (default)
      return baseUrl; // Default redirect to home page
    },
  },

  // Custom pages for sign-in and errors
  pages: {
    signIn: "/auth/login",  // Custom login page
    error: "/auth/error",   // Custom error page (if needed)
  },
});
