import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { db } from '../../lib/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const uploadDir = path.join(process.cwd(), 'public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    multiples: true,
    uploadDir,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ message: 'Form parsing error' });
    }

    function toStringField(field: string | string[] | undefined): string {
      if (!field) return '';
      return Array.isArray(field) ? field[0] : field;
    }

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const name = toStringField(fields.name).trim();
      const product_description = toStringField(fields.product_description).trim();
      const price = parseFloat(toStringField(fields.price));
      const subcategory_id = parseInt(toStringField(fields.subcategory_id), 10);
      const status = toStringField(fields.status) || 'active';
      const user_id = parseInt(toStringField(fields.user_id), 10);
      const location = toStringField(fields.location).trim(); // ✅ Extract location

      // Validation
      const missingFields: string[] = [];
      if (!name) missingFields.push('name');
      if (!product_description) missingFields.push('product_description');
      if (isNaN(price)) missingFields.push('price');
      if (isNaN(subcategory_id)) missingFields.push('subcategory_id');
      if (isNaN(user_id)) missingFields.push('user_id');
      if (!location) missingFields.push('location'); // ✅ Validate location

      if (missingFields.length > 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          message: 'Missing or invalid required fields',
          missingFields,
        });
      }

      const slug = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

      // ✅ Insert Ad with location
      const [result] = await connection.execute(
        `INSERT INTO ads (user_id, seller_id, subcategory_id, name, slug, product_description, status, price, location) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, user_id, subcategory_id, name, slug, product_description, status, price, location]
      );

      const adId = (result as any).insertId;

      // ✅ Handle image upload
      const imageFiles = Array.isArray(files['images[]'])
        ? (files['images[]'] as File[])
        : files['images[]']
        ? [files['images[]'] as File]
        : [];

      for (const file of imageFiles) {
        const relativePath = `/uploads/${path.basename(file.filepath)}`;
        await connection.execute(
          `INSERT INTO ad_images (ad_id, path) VALUES (?, ?)`,
          [adId, relativePath]
        );
      }

      await connection.commit();
      connection.release();

      return res.status(200).json({ message: 'Ad saved successfully!' });
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error('Database error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
}
