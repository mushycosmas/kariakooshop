import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Replace with user_id from session/auth in real app
    const user_id = 1;

    // Query ads with their first image (LEFT JOIN to ad_images)
    const [rows] = await db.execute(
      `SELECT a.id, a.name, a.price, a.status, 
              (SELECT path FROM ad_images WHERE ad_id = a.id LIMIT 1) as image_url
       FROM ads a
       WHERE a.user_id = ?`,
      [user_id]
    );

    res.status(200).json({ products: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
