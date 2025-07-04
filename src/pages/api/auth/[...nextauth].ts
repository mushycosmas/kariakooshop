import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "../../../lib/db";
import { RowDataPacket } from "mysql2";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile?.email) {
        const email = profile.email;
        const name = profile.name || "";
        const image = profile.picture || "";

        // Check if user exists
        const [rows] = await db.query<RowDataPacket[]>(
          "SELECT id FROM users WHERE email = ?",
          [email]
        );

        // If not, insert new user
        if (rows.length === 0) {
          const [firstName, ...lastParts] = name.split(" ");
          const lastName = lastParts.join(" ");

          await db.query(
            `INSERT INTO users 
              (name, user_type, first_name, last_name, location, email, password, phone, gender, birthday, address, avatar_url, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              name,
              "google", // or "customer", "guest", etc.
              firstName || "",
              lastName || "",
              "",        // location
              email,
              "",        // password (not used with Google login)
              "",        // phone
              "",        // gender
              null,      // birthday
              "",        // address
              image      // avatar_url
            ]
          );
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
