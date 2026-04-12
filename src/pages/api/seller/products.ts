import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userId = req.query.user_id;

    // ✅ Validate user ID
    if (!userId || Array.isArray(userId) || isNaN(Number(userId))) {
      return res.status(400).json({ message: 'Invalid or missing user_id' });
    }

    // ✅ Fetch ads with FULL location hierarchy
    const [ads] = await db.query(
      `
      SELECT 
        a.*,

        c.id AS category_id,
        c.name AS category_name,

        s.id AS subcategory_id,
        s.name AS subcategory_name,

        d.id AS district_id,
        d.name AS district_name,

        r.id AS region_id,
        r.name AS region_name,

        co.id AS country_id,
        co.name AS country_name

      FROM ads a

      LEFT JOIN sub_categories s ON a.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id

      LEFT JOIN districts d ON a.district_id = d.id
      LEFT JOIN regions r ON d.region_id = r.id
      LEFT JOIN countries co ON r.country_id = co.id

      WHERE a.user_id = ?
      `,
      [userId]
    );

    const adList = [];

    for (const ad of ads as any[]) {
      // ✅ Images
      const [imageRows] = await db.query(
        'SELECT path FROM ad_images WHERE ad_id = ?',
        [ad.id]
      );
      const images = (imageRows as any[]).map(row => row.path);

      // ✅ Wholesale tiers
      const [tierRows] = await db.query(
        'SELECT min_qty, max_qty, whole_seller_price FROM ad_wholesale_tiers WHERE ad_id = ?',
        [ad.id]
      );

      adList.push({
        ...ad,

        category: {
          id: ad.category_id,
          name: ad.category_name,
        },

        subcategory: {
          id: ad.subcategory_id,
          name: ad.subcategory_name,
        },

        country: {
          id: ad.country_id,
          name: ad.country_name,
        },

        region: {
          id: ad.region_id,
          name: ad.region_name,
        },

        district: {
          id: ad.district_id,
          name: ad.district_name,
        },

        images,
        wholesale_tiers: tierRows,
      });
    }

    return res.status(200).json({ products: adList });

  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}