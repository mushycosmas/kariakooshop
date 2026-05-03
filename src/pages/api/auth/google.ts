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
    const { id_token } = req.body;

    if (!id_token) {
      return res.status(400).json({
        message: "ID token is required",
      });
    }

    const googleResponse = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`
    );

    const googleUser = googleResponse.data;

    const email = googleUser.email;
    const name = googleUser.name || "";
    const image = googleUser.picture || "";
    
    console.log("🔥 Google Response:", googleResponse.data);

    if (!email) {
      return res.status(400).json({
        message: "No email returned by Google",
      });
    }

    const [rows]: any = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    let userId: number;

    if (rows.length === 0) {
      const [firstName, ...lastParts] = name.split(" ");
      const lastName = lastParts.join(" ");

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