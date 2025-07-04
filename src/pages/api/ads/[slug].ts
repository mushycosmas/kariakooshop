import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';
import { RowDataPacket } from 'mysql2/promise';

interface Ad extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  product_description: string;
  price: number;
  status: string;
  subcategory_id: number;
  user_id: number;
  created_at?: string;
  updated_at?: string;
  images?: Image[];
}

interface Image extends RowDataPacket {
  path: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ message: 'Invalid slug' });
  }

  const connection = await db.getConnection();

  try {
    // Fetch ad by slug
    const [ads] = await connection.execute<Ad[]>(
      `SELECT * FROM ads WHERE slug = ? LIMIT 1`,
      [slug]
    );

    if (ads.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Ad not found' });
    }

    const ad = ads[0];

    // Fetch images for the ad
    const [images] = await connection.execute<Image[]>(
      `SELECT path FROM ad_images WHERE ad_id = ?`,
      [ad.id]
    );

    connection.release();

    ad.images = images;

    return res.status(200).json(ad);
  } catch (error) {
    console.error('Database error:', error);
    connection.release();
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
