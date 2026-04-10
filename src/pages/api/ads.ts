'use client';

import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { db } from '../../lib/db';

export const config = {
  api: { bodyParser: false },
};

// Parse form
function parseForm(
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  const uploadDir = path.join(process.cwd(), 'public/uploads');

  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({
    multiples: true,
    uploadDir,
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  let connection: any;

  try {
    const { fields, files } = await parseForm(req);

    const toStringField = (field: string | string[] | undefined) =>
      !field ? '' : Array.isArray(field) ? field[0] : field;

    connection = await db.getConnection();
    await connection.beginTransaction();

    // Basic fields
    const name = toStringField(fields.name).trim();
    const product_description = toStringField(fields.product_description).trim();
    const subcategory_id = parseInt(toStringField(fields.subcategory_id), 10);
    const location = toStringField(fields.location).trim();
    const district_id = parseInt(toStringField(fields.district_id), 10);
    const user_id = parseInt(toStringField(fields.user_id), 10);
    const status = toStringField(fields.status) || 'active';

    // Base price
    const base_price = parseFloat(toStringField(fields.price)) || 0;

    // Wholesale tiers
    const wholesaleTiersRaw = toStringField(fields.wholesale_tiers);
    let wholesaleTiers: { min_qty: number; max_qty: number; whole_seller_price: number }[] = [];

    if (wholesaleTiersRaw) {
      try {
        wholesaleTiers = JSON.parse(wholesaleTiersRaw).map((t: any) => ({
          min_qty: parseInt(t.min_qty, 10),
          max_qty: parseInt(t.max_qty, 10),
          whole_seller_price: parseFloat(t.whole_seller_price),
        }));
      } catch {
        wholesaleTiers = [];
      }
    }

    // Validation
    const missingFields: string[] = [];
    if (!name) missingFields.push('name');
    if (!product_description) missingFields.push('product_description');
    if (!base_price) missingFields.push('price');
    if (!subcategory_id) missingFields.push('subcategory_id');
    if (!user_id) missingFields.push('user_id');
    if (!location) missingFields.push('location');
    if (!district_id) missingFields.push('district_id');

    if (missingFields.length > 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        message: 'Missing or invalid required fields',
        missingFields,
      });
    }

    // Slug
    const slug = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

    // Insert main ad (now includes district_id)
    const [result] = await connection.execute(
      `INSERT INTO ads 
      (user_id, seller_id, subcategory_id, name, slug, product_description, status, price, location, district_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, user_id, subcategory_id, name, slug, product_description, status, base_price, location, district_id]
    );

    const adId = (result as any).insertId;

    // Insert wholesale tiers
    for (const tier of wholesaleTiers) {
      if (tier.min_qty > 0 && tier.max_qty >= tier.min_qty && tier.whole_seller_price > 0) {
        await connection.execute(
          `INSERT INTO ad_wholesale_tiers 
          (ad_id, min_qty, max_qty, whole_seller_price) 
          VALUES (?, ?, ?, ?)`,
          [adId, tier.min_qty, tier.max_qty, tier.whole_seller_price]
        );
      }
    }

    // Save images
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

    return res.status(200).json({
      message: 'Ad saved successfully!',
      ad_id: adId,
    });
  } catch (error: any) {
    console.error('Error caught:', error);
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    return res.status(500).json({
      message: 'Internal server error',
      error: error?.sqlMessage || error?.message || String(error),
    });
  }
}