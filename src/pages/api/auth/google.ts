import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import jwt from "jsonwebtoken";
import { db } from "../../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({
        message: "Access token is required",
      });
    }

    // ✅ Get user info from Google (CORRECT WAY)
    const googleResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const googleUser = googleResponse.data;

    console.log("🔥 Google User:", googleUser);

    const email = googleUser.email;
    const name = googleUser.name || "";
    const image = googleUser.picture || "";

    if (!email) {
      return res.status(400).json({
        message: "No email returned by Google",
      });
    }

    // ✅ Check if user exists
    const [rows]: any = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    let userId: number;

    if (rows.length === 0) {
      const nameParts = name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // ✅ Create new user
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

    // ✅ Create JWT token
    const token = jwt.sign(
      {
        id: userId,
        email,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    // ✅ Response
    return res.status(200).json({
      token,
      user: {
        id: userId,
        name,
        email,
        image,
      },
    });
  } catch (error: any) {
    console.error(
      "Google auth error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      message: "Google authentication failed",
    });
  }
}