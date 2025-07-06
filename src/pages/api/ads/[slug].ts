import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';
import { RowDataPacket } from 'mysql2/promise';

interface Seller {
  id: number;
  name: string;
  avatar?: string | null;
}

interface Image extends RowDataPacket {
  path: string;
}

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
  seller?: Seller;
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
    // Fetch ad by slug with seller info joined
    const [ads] = await connection.execute<Ad[]>(
      `SELECT 
         a.*, 
         u.id AS seller_id, 
         u.name AS seller_name, 
         u.avatar AS seller_avatar 
       FROM ads a
       JOIN users u ON a.user_id = u.id
       WHERE a.slug = ? 
       LIMIT 1`,
      [slug]
    );

    if (ads.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Ad not found' });
    }

    const ad = ads[0];

    // Map seller info into nested seller object
    ad.seller = {
      id: ad.seller_id,
      name: ad.seller_name,
      avatar: ad.seller_avatar ?? null,
    };

    // Remove flat seller fields
    delete (ad as any).seller_id;
    delete (ad as any).seller_name;
    delete (ad as any).seller_avatar;

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
