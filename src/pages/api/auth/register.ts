import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { db } from "../../../lib/db";

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), "/public/uploads");

// create upload folder if not exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// parse form-data
const parseForm = (req: NextApiRequest): Promise<any> => {
  const form = formidable({
    uploadDir,
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { fields } = await parseForm(req);

    const first_name = fields.first_name?.toString();
    const last_name = fields.last_name?.toString();
    const email = fields.email?.toString();
    const phone = fields.phone?.toString();
    const password = fields.password?.toString();

    if (!first_name || !last_name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🔥 CHECK USER (RAW SQL FIX)
    const [existingRows]: any = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingRows.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 INSERT USER (RAW SQL FIX)
    const [result]: any = await db.query(
      `INSERT INTO users (first_name, last_name, email, phone, password)
       VALUES (?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone, hashedPassword]
    );

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: result.insertId,
        first_name,
        last_name,
        email,
        phone,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
}