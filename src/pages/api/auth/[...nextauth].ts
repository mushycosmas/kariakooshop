import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "../../../lib/db";
import { RowDataPacket } from "mysql2";

interface GoogleProfile {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  [key: string]: any;
}

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",  // Use JWT for session management
  },

  callbacks: {
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
          // User does not exist, insert new user
          const [firstName, ...lastParts] = name.split(" ");
          const lastName = lastParts.join(" ");

          const [result]: any = await db.query(
            `INSERT INTO users 
              (name, user_type, first_name, last_name, location, email, password, phone, gender, birthday, address, avatar_url, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              name,
              "seller",  // User type
              firstName,
              lastName,
              null,       // location
              email,
              "",         // password
              "",         // phone
              null,        // gender
              null,        // birthday
              "",         // address
              image,       // avatar_url
            ]
          );

          userId = result.insertId;
        } else {
          // Existing user
          userId = rows[0].id;
        }

        // Attach user ID to the token
        token.id = userId;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;  // Attach user ID to the session
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // If user is authenticated, redirect to the seller dashboard
      return baseUrl + "/seller/dashboard";
    },
  },
});
