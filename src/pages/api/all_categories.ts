import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db';
import { RowDataPacket } from 'mysql2';

interface CategoryRow extends RowDataPacket {
  category_id: number;
  category_name: string;
  category_icon: string | null;
  subcategory_id: number | null;
  subcategory_name: string | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const [rows] = await db.query<CategoryRow[]>(`
      SELECT 
    c.id AS category_id,
    c.name AS category_name,
    c.icon AS category_icon,
    s.id AS subcategory_id,
    s.name AS subcategory_name
    FROM categories c
    JOIN sub_categories s ON s.category_id = c.id
    ORDER BY c.id, s.id;

    `);

    // Group categories and their subcategories
    const categoryMap = new Map<string, {
      id: string;
      name: string;
      icon: string;
      subcategories: { id: string; name: string }[];
    }>();

    rows.forEach(row => {
      const catId = row.category_id.toString();
      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, {
          id: catId,
          name: row.category_name,
          icon: row.category_icon || "📦",
          subcategories: []
        });
      }

      if (row.subcategory_id) {
        categoryMap.get(catId)!.subcategories.push({
          id: row.subcategory_id.toString(),
          name: row.subcategory_name!
        });
      }
    });

    const categories = Array.from(categoryMap.values()).filter(cat => cat.subcategories.length > 0);

    res.status(200).json(categories);
  } catch (err) {
    console.error("Error fetching categories without ads:", err);
    res.status(500).json({ error: "Failed to load categories" });
  }
}
