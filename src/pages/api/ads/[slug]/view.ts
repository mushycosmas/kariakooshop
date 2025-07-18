import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../../lib/db';
import { RowDataPacket } from 'mysql2/promise';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query; // ✅ FIXED: match [slug] folder name

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing slug' });
  }

  try {
    // Check if ad exists
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT id FROM ads WHERE slug = ? LIMIT 1',
      [slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    // Increment view count
    await db.execute('UPDATE ads SET viewed = viewed + 1 WHERE slug = ?', [slug]);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}
