import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db'; // Your DB connection file

// Disable default Next.js body parser (we'll handle parsing with formidable)
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Ensure uploads directory exists
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ message: 'Error parsing form data', error: err.message });
    }

    try {
      // Helper to flatten fields that might come as arrays
      function cleanValue(value: any) {
        if (Array.isArray(value)) return value.length > 0 ? value[0] : null;
        return value === undefined || value === '' ? null : value;
      }

      // Extract & clean fields
      const firstName = cleanValue(fields.firstName);
      const lastName = cleanValue(fields.lastName);
      const location = cleanValue(fields.location);
      const birthdayNormalized = cleanValue(fields.birthday);
      const gender = cleanValue(fields.gender);
      const phone = cleanValue(fields.phone);
      const email = cleanValue(fields.email);
      const address = cleanValue(fields.address);
      const userId = fields.id ? Number(cleanValue(fields.id)) : null;

      // Handle avatar file URL
      let avatarUrl: string | null = null;
      const avatarFile = files.avatar as formidable.File | formidable.File[] | undefined;
      if (avatarFile) {
        const file = Array.isArray(avatarFile) ? avatarFile[0] : avatarFile;
        const fileName = path.basename(file.filepath);
        avatarUrl = `/uploads/${fileName}`;
      }

      if (userId) {
        // Update existing user
        const params = [
          firstName,
          lastName,
          location,
          birthdayNormalized,
          gender,
          phone,
          email,
          address,
          avatarUrl,
          userId,
        ];

        console.log('Update params:', params);

        await db.execute(
          `UPDATE users SET
            first_name=?, last_name=?, location=?, birthday=?, gender=?, phone=?, email=?, address=?, avatar_url=?
            WHERE id=?`,
          params
        );

        return res.status(200).json({ message: 'User updated successfully' });
      } else {
        // Insert new user
        const params = [
          firstName,
          lastName,
          location,
          birthdayNormalized,
          gender,
          phone,
          email,
          address,
          avatarUrl,
        ];

        await db.execute(
          `INSERT INTO users (first_name, last_name, location, birthday, gender, phone, email, address, avatar_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          params
        );

        return res.status(201).json({ message: 'User created successfully' });
      }
    } catch (error: any) {
      console.error('DB error:', error);
      return res.status(500).json({ message: 'Database error', error: error.message });
    }
  });
}
