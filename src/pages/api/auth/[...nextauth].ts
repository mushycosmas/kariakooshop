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

        let userId: number;

        if (rows.length === 0) {
          const [firstName, ...lastParts] = name.split(" ");
          const lastName = lastParts.join(" ");

          // Insert new user with proper NULLs and valid enums
        
        const [result]: any = await db.query(
  `INSERT INTO users 
    (name, user_type, first_name, last_name, location, email, password, phone, gender, birthday, address, avatar_url, created_at, updated_at) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
  [
    name,
    "seller",           // user_type must be exact enum string
    firstName,
    lastName,
    null,               // location nullable: pass null if no value
    email,
    "",                 // password blank string or hash
    "",                 // phone blank string if no phone
    null,               // gender must be null or 'male' or 'female', never empty string
    null,               // birthday null
    "",                 // address blank string if none
    image,
  ]
);


          userId = result.insertId;
        } else {
          userId = rows[0].id;
        }

        token.id = userId;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
});
