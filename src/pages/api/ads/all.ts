import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    page = "1",
    pageSize = "12",
    search = "",
    subcategory_id = ""
  } = req.query;

  const pageNum = parseInt(page as string, 10);
  const sizeNum = parseInt(pageSize as string, 10);
  const offset = (pageNum - 1) * sizeNum;

  try {
    let whereClauses: string[] = [];
    let params: any[] = [];

    if (search) {
      whereClauses.push("a.name LIKE ?");
      params.push(`%${search}%`);
    }

    if (subcategory_id && subcategory_id !== "All" && subcategory_id !== "") {
      whereClauses.push("a.subcategory_id = ?");
      params.push(subcategory_id);
    }

    const whereSQL = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

    // Main query to fetch ads with category & subcategory info
    const adQuery = `
      SELECT 
        a.*, 
        s.name AS subcategory_name, 
        s.slug AS subcategory_slug,
        c.name AS category_name, 
        c.slug AS category_slug
      FROM ads a
      JOIN sub_categories s ON s.id = a.subcategory_id
      JOIN categories c ON c.id = s.category_id
      ${whereSQL}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(sizeNum, offset);

    const [ads] = await db.query(adQuery, params);

    const adIds = (ads as any[]).map(ad => ad.id);

    if (adIds.length === 0) {
      res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=30");
      return res.status(200).json({ products: [], total: 0 });
    }

    // Fetch related images for the ads
    const [images] = await db.query(
      `SELECT * FROM ad_images WHERE ad_id IN (${adIds.map(() => "?").join(",")})`,
      adIds
    );

    // Group images by ad_id
    const imagesByAd: { [key: number]: any[] } = {};
    (images as any[]).forEach(img => {
      if (!imagesByAd[img.ad_id]) imagesByAd[img.ad_id] = [];
      imagesByAd[img.ad_id].push(img);
    });

    // Combine ads with their images and category info, and use created_at for postedTime
    const adsWithImages = (ads as any[]).map(ad => ({
      ...ad,
      images: imagesByAd[ad.id] || [],
      category: {
        name: ad.category_name,
        slug: ad.category_slug,
      },
      subcategory: {
        name: ad.subcategory_name,
        slug: ad.subcategory_slug,
      },
      postedTime: ad.created_at, // Use created_at instead of postedTime
    }));

    // Count total for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ads a
      JOIN sub_categories s ON s.id = a.subcategory_id
      JOIN categories c ON c.id = s.category_id
      ${whereSQL}
    `;

    // Remove limit and offset params for count
    const [countRows] = await db.query(countQuery, params.slice(0, params.length - 2));
    const total = (countRows as any)[0].total;

    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=30");
    return res.status(200).json({ products: adsWithImages, total });

  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
