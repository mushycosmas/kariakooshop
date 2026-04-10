import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';
import { RowDataPacket } from 'mysql2/promise';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { adId, message,buyerId } = req.body;


  if (!adId || !message) {
    return res.status(400).json({ error: 'Missing adId or message' });
  }

  try {
    // 1. Find seller for the ad
    const [adRows] = await db.query<RowDataPacket[]>(
      'SELECT seller_id FROM ads WHERE id = ? LIMIT 1',
      [adId]
    );

    if (adRows.length === 0) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    const sellerId = adRows[0].seller_id;

    // 2. Check for existing conversation
    const [convRows] = await db.query<RowDataPacket[]>(
      'SELECT id FROM conversations WHERE ad_id = ? AND buyer_id = ? AND seller_id = ? LIMIT 1',
      [adId, buyerId, sellerId]
    );

    let conversationId: number;

    if (convRows.length > 0) {
      conversationId = convRows[0].id;
    } else {
      // 3. Create new conversation
      const [insertConv] = await db.query(
        'INSERT INTO conversations (ad_id, buyer_id, seller_id) VALUES (?, ?, ?)',
        [adId, buyerId, sellerId]
      );
      // @ts-ignore
      conversationId = insertConv.insertId;
    }

    // 4. Save message
    await db.query(
      'INSERT INTO messages (conversation_id, sender_id, message) VALUES (?, ?, ?)',
      [conversationId, buyerId, message]
    );

    return res.status(200).json({ success: true, conversationId });
  } catch (error) {
    console.error('[Chat API] Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
