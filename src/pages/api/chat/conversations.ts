import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';
import { RowDataPacket } from 'mysql2';

interface ConversationResponse extends RowDataPacket {
  conversationId: number;
  adId: number;
  adName: string;
  adBrand: string;
  adPrice: string;
  adImage: string | null;
  updated_at: Date;
  buyerId: number;
  buyerName: string;
  buyerAvatar: string | null;
  sellerId: number;
  sellerName: string;
  sellerAvatar: string | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const userId = req.query.userId;
  if (!userId || Array.isArray(userId) || isNaN(Number(userId))) {
    return res.status(400).json({ error: 'Invalid or missing userId' });
  }

  try {
    const [rows] = await db.query<ConversationResponse[]>(
      `
      SELECT 
        c.id AS conversationId,
        c.ad_id AS adId,
        a.name AS adName,
        a.brand AS adBrand,
        a.price AS adPrice,
        MIN(ai.path) AS adImage,
        c.updated_at,
        c.buyer_id AS buyerId,
        buyer.name AS buyerName,
        buyer.avatar_url AS buyerAvatar,
        c.seller_id AS sellerId,
        seller.name AS sellerName,
        seller.avatar_url AS sellerAvatar
      FROM conversations c
      JOIN ads a ON a.id = c.ad_id
      LEFT JOIN ad_images ai ON ai.ad_id = a.id
      JOIN users buyer ON buyer.id = c.buyer_id
      JOIN users seller ON seller.id = c.seller_id
      WHERE c.buyer_id = ? OR c.seller_id = ?
      GROUP BY c.id
      ORDER BY c.updated_at DESC
      `,
      [Number(userId), Number(userId)]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
