import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';
import { RowDataPacket } from 'mysql2/promise';

interface Image extends RowDataPacket {
  path: string;
  ad_id: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { slug } = req.query;
  console.log("Kelvin Cosmas",slug);

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ message: 'Invalid slug' });
  }

  try {
    // Fetch the ad and join with category, subcategory, and user
    const [ads] = await db.query(
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
        u.phone AS user_phone
      FROM ads a
      JOIN sub_categories s ON s.id = a.subcategory_id
      JOIN categories c ON c.id = s.category_id
      JOIN users u ON u.id = a.user_id
      WHERE a.slug = ?
      LIMIT 1
    `,
      [slug]
    );

    if ((ads as RowDataPacket[]).length === 0) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    const ad = (ads as any[])[0];

    // Fetch related images
    const [images] = await db.query<Image[]>(
      `SELECT * FROM ad_images WHERE ad_id = ?`,
      [ad.id]
    );

    const result = {
      id: ad.id,
      name: ad.name,
      price: ad.price,
      description: ad.product_description,
      created_at: ad.created_at,
      status: ad.status,
      slug: ad.slug,
      images: images || [],
      category: {
        name: ad.category_name,
        slug: ad.category_slug,
      },
      subcategory: {
        name: ad.subcategory_name,
        slug: ad.subcategory_slug,
      },
      user: {
        id: ad.user_id,
        name: ad.user_name,
        email: ad.user_email,
        phone: ad.user_phone,
        avatar_url: ad.avatar_url,
      },
      postedTime: ad.created_at,
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching ad by slug:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
