import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../lib/db";

type Product = {
  id: number;
  name: string;
  viewed: number;
  image?: string; // optional product image
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sellerId = req.query.sellerId;

  if (!sellerId) {
    return res.status(400).json({ error: "sellerId is required" });
  }

  try {
    const [products]: any = await db.query(
      `SELECT 
  ads.id,
  ads.name,
  ads.viewed,
  MIN(ad_images.path) AS image
FROM ads
LEFT JOIN ad_images ON ad_images.ad_id = ads.id
WHERE ads.user_id = ?
GROUP BY ads.id, ads.name, ads.viewed
ORDER BY ads.viewed DESC
LIMIT 10;`,
      [sellerId]
    );

    return res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching top products:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}