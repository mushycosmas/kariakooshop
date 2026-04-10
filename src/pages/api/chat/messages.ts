import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';
import { RowDataPacket } from 'mysql2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { conversationId } = req.query;

    if (!conversationId || isNaN(Number(conversationId))) {
      return res.status(400).json({ error: 'Missing or invalid conversationId' });
    }

    try {
      const [rows] = await db.query<RowDataPacket[]>(
        `
        SELECT sender_id, message, sent_at 
        FROM messages 
        WHERE conversation_id = ? 
        ORDER BY sent_at ASC
        `,
        [conversationId]
      );

      const messages = rows.map((row) => ({
        from: row.sender_id === 2 ? 'buyer' : 'seller', // Adjust if needed
        text: row.message,
        sentAt: row.sent_at,
      }));

      return res.status(200).json(messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  if (req.method === 'POST') {
    const { conversationId, senderId, from, text, sentAt } = req.body;

    if (!conversationId || !senderId || !from || !text || !sentAt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      await db.query(
        `
        INSERT INTO messages (conversation_id, sender_id, sender_type, message, sent_at)
        VALUES (?, ?, ?, ?, ?)
        `,
        [conversationId, senderId, from, text, sentAt]
      );

      return res.status(201).json({ success: true });
    } catch (error) {
      console.error('Failed to insert message:', error);
      return res.status(500).json({ error: 'Database insertion failed' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
