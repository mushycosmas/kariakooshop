import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "../../../lib/db";
import { RowDataPacket } from "mysql2";

interface GoogleProfile {
  id: string; // good to have but not necessarily required here
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
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile?.email) {
        const prof = profile as GoogleProfile;
        const email = prof.email;
        const name = prof.name || "";
        const image = prof.picture || "";

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
              "google",
              firstName || "",
              lastName || "",
              "", // location
              email,
              "", // password
              "", // phone
              "", // gender
              null, // birthday
              "", // address
              image,
            ]
          );
        }
      }

      // You can assign token.id here for consistency if you want
      if (token.sub && !token.id) {
        token.id = token.sub;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? ""; // use token.id if exists
      }
      return session;
    },
  },
});
