import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';
import { RowDataPacket } from 'mysql2/promise';

interface Image extends RowDataPacket {
  path: string;
  ad_id: number;
}

interface WholesaleTier extends RowDataPacket {
  id: number;
  ad_id: number;
  min_qty: number;
  max_qty: number;
  price: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ message: 'Invalid slug' });
  }

  try {
    const connection = await db.getConnection();

    // ---------------- MAIN PRODUCT ----------------
    const [ads] = await connection.query(
      `
      SELECT 
        a.*, 
        s.name AS subcategory_name, 
        s.slug AS subcategory_slug,
        c.name AS category_name, 
        c.slug AS category_slug,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.avatar_url,
        u.phone AS user_phone,

        d.id AS district_id,
        d.name AS district_name,

        r.id AS region_id,
        r.name AS region_name,

        co.id AS country_id,
        co.name AS country_name

      FROM ads a
      JOIN sub_categories s ON s.id = a.subcategory_id
      JOIN categories c ON c.id = s.category_id
      JOIN users u ON u.id = a.user_id

      LEFT JOIN districts d ON d.id = a.district_id
      LEFT JOIN regions r ON r.id = d.region_id
      LEFT JOIN countries co ON co.id = r.country_id

      WHERE a.slug = ?
      LIMIT 1
    `,
      [slug]
    );

    if ((ads as RowDataPacket[]).length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Ad not found' });
    }

    const ad = (ads as any[])[0];

    // ---------------- IMAGES ----------------
    const [images] = await connection.query<Image[]>(
      `SELECT * FROM ad_images WHERE ad_id = ?`,
      [ad.id]
    );

    // ---------------- WHOLESALE ----------------
    const [tiers] = await connection.query<WholesaleTier[]>(
      `SELECT * FROM ad_wholesale_tiers WHERE ad_id = ? ORDER BY min_qty ASC`,
      [ad.id]
    );

    connection.release();

    // ---------------- RESPONSE ----------------
    const result = {
      id: ad.id,
      slug: ad.slug,

      // BASIC INFO
      name: ad.name,
      description: ad.product_description,
      location: ad.location,
      status: ad.status,

      // LOCATION STRUCTURE
      country: ad.country_id
        ? { id: ad.country_id, name: ad.country_name }
        : null,

      region: ad.region_id
        ? { id: ad.region_id, name: ad.region_name }
        : null,

      district: ad.district_id
        ? { id: ad.district_id, name: ad.district_name }
        : null,

      // PRICING
      price: ad.price,
      retail_price: ad.retail_price || null,
      min_order_qty: ad.min_order_qty || null,

      // WHOLESALE
      wholesale_tiers: tiers || [],

      // META
      viewed: ad.viewed || 0,
      created_at: ad.created_at,

      // IMAGES
      images: images || [],

      // CATEGORY
      category: {
        name: ad.category_name,
        slug: ad.category_slug,
      },

      subcategory: {
        name: ad.subcategory_name,
        slug: ad.subcategory_slug,
      },

      // USER
      user: {
        id: ad.user_id,
        name: ad.user_name,
        email: ad.user_email,
        phone: ad.user_phone,
        avatar_url: ad.avatar_url,
      },
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching ad by slug:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}