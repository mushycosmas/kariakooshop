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
        const [rows] = await db.query<RowDataPacket[]>(`
          SELECT sc.*, c.name AS category_name
          FROM sub_categories sc
          JOIN categories c ON sc.category_id = c.id
          ORDER BY sc.created_at DESC
        `);
        return res.status(200).json(rows);
      }

      case 'POST': {
        const { name, slug, category_id } = req.body;

        if (!name || !category_id) {
          return res.status(400).json({ error: 'Name and category_id are required' });
        }

        const finalSlug = slug?.trim() || generateSlug(name);

        const [result] = await db.execute(
          `INSERT INTO sub_categories (name, slug, category_id) VALUES (?, ?, ?)`,
          [name, finalSlug, category_id]
        );

        return res.status(201).json({
          message: 'Subcategory created',
          id: (result as any).insertId,
        });
      }

      case 'PUT': {
        const id = req.query.id;
        const { name, slug, category_id } = req.body;

        if (!id || !name || !category_id) {
          return res.status(400).json({ error: 'ID, name, and category_id are required' });
        }

        const finalSlug = slug?.trim() || generateSlug(name);

        await db.execute(
          `UPDATE sub_categories SET name = ?, slug = ?, category_id = ? WHERE id = ?`,
          [name, finalSlug, category_id, id]
        );

        return res.status(200).json({ message: 'Subcategory updated' });
      }

      case 'DELETE': {
        const id = req.query.id;
        if (!id) return res.status(400).json({ error: 'Subcategory ID is required' });

        await db.execute(`DELETE FROM sub_categories WHERE id = ?`, [id]);
        return res.status(204).end();
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err) {
    console.error('Subcategories API Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
