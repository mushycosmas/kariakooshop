import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userId = req.query.user_id;

    // Validate user ID
    if (!userId || Array.isArray(userId) || isNaN(Number(userId))) {
      return res.status(400).json({ message: 'Invalid or missing user_id' });
    }

    // Query ads with their first image
    const [rows] = await db.execute(
      `SELECT a.id, a.name, a.price, a.status, 
              (SELECT path FROM ad_images WHERE ad_id = a.id LIMIT 1) AS image_url
       FROM ads a
       WHERE a.user_id = ?`,
      [userId]
    );

    return res.status(200).json({ products: rows });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
