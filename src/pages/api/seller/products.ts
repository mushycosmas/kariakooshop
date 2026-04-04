import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userId = req.query.user_id;

    // Validate user ID
    if (!userId || Array.isArray(userId) || isNaN(Number(userId))) {
      return res.status(400).json({ message: 'Invalid or missing user_id' });
    }

    // Fetch all ads for the user with category and subcategory
    const [ads] = await db.query(
      `SELECT a.*, 
              c.id AS category_id, c.name AS category_name,
              s.id AS subcategory_id, s.name AS subcategory_name
       FROM ads a
       LEFT JOIN sub_categories s ON a.subcategory_id = s.id
       LEFT JOIN categories c ON s.category_id = c.id
       WHERE a.user_id = ?`,
      [userId]
    );

    const adList = [];

    for (const ad of ads as any[]) {
      // Fetch all images for each ad
      const [imageRows] = await db.query(
        'SELECT path FROM ad_images WHERE ad_id = ?',
        [ad.id]
      );
      const images = (imageRows as any[]).map((row) => row.path);

      // Fetch wholesale tiers
      const [tierRows] = await db.query(
        'SELECT min_qty, max_qty, whole_seller_price FROM ad_wholesale_tiers WHERE ad_id = ?',
        [ad.id]
      );
      const wholesale_tiers = tierRows as any[];

      adList.push({
        ...ad,
        category: { id: ad.category_id, name: ad.category_name },
        subcategory: { id: ad.subcategory_id, name: ad.subcategory_name },
        images,
        wholesale_tiers,
      });
    }

    return res.status(200).json({ products: adList });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}