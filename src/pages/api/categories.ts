// pages/api/categories.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db';
import { RowDataPacket } from 'mysql2';

const generateSlug = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET': {
        const [rows] = await db.query<RowDataPacket[]>(
          'SELECT id, name, slug, created_at, updated_at FROM categories ORDER BY created_at DESC'
        );
        return res.status(200).json(rows);
      }

      case 'POST': {
        const { name, slug } = req.body;
        if (!name) {
          return res.status(400).json({ error: 'Category name is required' });
        }

        const finalSlug = slug?.trim() || generateSlug(name);

        const [result] = await db.execute(
          'INSERT INTO categories (name, slug) VALUES (?, ?)',
          [name, finalSlug]
        );

        return res.status(201).json({
          message: 'Category created',
          id: (result as any).insertId,
        });
      }

      case 'PUT': {
        const id = req.query.id;
        const { name, slug } = req.body;

        if (!id || !name) {
          return res.status(400).json({ error: 'ID and name are required' });
        }

        const finalSlug = slug?.trim() || generateSlug(name);

        await db.execute(
          'UPDATE categories SET name = ?, slug = ? WHERE id = ?',
          [name, finalSlug, id]
        );

        return res.status(200).json({ message: 'Category updated' });
      }

      case 'DELETE': {
        const id = req.query.id;
        if (!id) return res.status(400).json({ error: 'ID is required' });

        await db.execute('DELETE FROM categories WHERE id = ?', [id]);
        return res.status(204).end();
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err) {
    console.error('Category API Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
