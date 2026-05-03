import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { access_token } = await req.json();

    if (!access_token) {
      return NextResponse.json(
        { message: "Access token is required" },
        { status: 400 }
      );
    }

    // 1. Verify token with Google
    const googleRes = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const googleUser = googleRes.data;

    const email = googleUser.email;
    const name = googleUser.name || "";
    const image = googleUser.picture || "";

    if (!email) {
      return NextResponse.json(
        { message: "Google account has no email" },
        { status: 400 }
      );
    }

    // 2. Check user in DB
    const [rows]: any = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    let userId: number;

    // 3. Create user if not exists
    if (rows.length === 0) {
      const [firstName, ...last] = name.split(" ");
      const lastName = last.join(" ");

      const [result]: any = await db.query(
        `INSERT INTO users 
        (name, user_type, first_name, last_name, email, avatar_url, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          name,
          "seller",
          firstName,
          lastName,
          email,
          image,
        ]
      );

      userId = result.insertId;
    } else {
      userId = rows[0].id;
    }

    // 4. Create your JWT token
    const appToken = jwt.sign(
      {
        id: userId,
        email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    // 5. Return response to mobile app
    return NextResponse.json({
      token: appToken,
      user: {
        id: userId,
        email,
        name,
        image,
      },
    });
  } catch (error: any) {
    console.log("Google Auth Error:", error.response?.data || error.message);

    return NextResponse.json(
      { message: "Google authentication failed" },
      { status: 500 }
    );
  }
}