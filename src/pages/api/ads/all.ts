import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { page = "1", pageSize = "12", search = "", subcategory_id = "" } = req.query;

  const pageNum = parseInt(page as string, 10);
  const sizeNum = parseInt(pageSize as string, 10);
  const offset = (pageNum - 1) * sizeNum;

  if (isNaN(pageNum) || isNaN(sizeNum) || pageNum < 1 || sizeNum < 1) {
    return res.status(400).json({ message: "Invalid pagination parameters." });
  }

  try {
    let whereClauses: string[] = [];
    let params: any[] = [];

    // ---------------- SEARCH ----------------
    if (search) {
      const words = (search as string).trim().split(/\s+/);
      words.forEach((word) => {
        whereClauses.push("a.name LIKE ?");
        params.push(`%${word}%`);
      });
    }

    // ---------------- SUBCATEGORY FILTER ----------------
    if (subcategory_id && subcategory_id !== "All") {
      whereClauses.push("a.subcategory_id = ?");
      params.push(subcategory_id);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // ---------------- MAIN QUERY ----------------
    const adQuery = `
      SELECT 
        a.*, 
        s.name AS subcategory_name, s.slug AS subcategory_slug,
        c.name AS category_name, c.slug AS category_slug,
        u.id AS user_id, u.name AS user_name, u.email AS user_email, u.avatar_url, u.phone AS user_phone,
        r.id AS region_id, r.name AS region_name,
        d.id AS district_id, d.name AS district_name,
        cn.id AS country_id, cn.name AS country_name
      FROM ads a
      JOIN sub_categories s ON s.id = a.subcategory_id
      JOIN categories c ON c.id = s.category_id
      JOIN users u ON u.id = a.user_id
      LEFT JOIN regions r ON r.id = a.region_id
      LEFT JOIN districts d ON d.id = a.district_id
      LEFT JOIN countries cn ON cn.id = r.country_id
      ${whereSQL}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const queryParams = [...params, sizeNum, offset];
    const [ads] = await db.query(adQuery, queryParams);
    const adList = ads as any[];

    if (adList.length === 0) {
      return res.status(200).json({ products: [], total: 0 });
    }

    const adIds = adList.map((ad) => ad.id);

    // ---------------- IMAGES ----------------
    const [images] = await db.query(
      `SELECT * FROM ad_images WHERE ad_id IN (${adIds.map(() => "?").join(",")})`,
      adIds
    );
    const imagesByAd: Record<number, any[]> = {};
    (images as any[]).forEach((img) => {
      if (!imagesByAd[img.ad_id]) imagesByAd[img.ad_id] = [];
      imagesByAd[img.ad_id].push(img);
    });

    // ---------------- WHOLESALE ----------------
    const [tiers] = await db.query(
      `SELECT * FROM ad_wholesale_tiers 
       WHERE ad_id IN (${adIds.map(() => "?").join(",")})
       ORDER BY min_qty ASC`,
      adIds
    );
    const tiersByAd: Record<number, any[]> = {};
    (tiers as any[]).forEach((tier) => {
      if (!tiersByAd[tier.ad_id]) tiersByAd[tier.ad_id] = [];
      tiersByAd[tier.ad_id].push(tier);
    });

    // ---------------- FINAL FORMAT ----------------
    const adsWithDetails = adList.map((ad) => ({
      id: ad.id,
      slug: ad.slug,
      name: ad.name,
      description: ad.product_description,
      location: ad.location,
      status: ad.status,
      price: ad.price,
      retail_price: ad.retail_price || null,
      min_order_qty: ad.min_order_qty || null,
      wholesale_tiers: tiersByAd[ad.id] || [],
      viewed: ad.viewed || 0,
      created_at: ad.created_at,
      images: imagesByAd[ad.id] || [],

      // CATEGORY
      category: { name: ad.category_name, slug: ad.category_slug },
      subcategory: { name: ad.subcategory_name, slug: ad.subcategory_slug },

      // USER
      user: {
        id: ad.user_id,
        name: ad.user_name,
        email: ad.user_email,
        phone: ad.user_phone,
        avatar_url: ad.avatar_url,
      },

      // REGION, DISTRICT & COUNTRY
      region: ad.region_id ? { id: ad.region_id, name: ad.region_name } : null,
      district: ad.district_id ? { id: ad.district_id, name: ad.district_name } : null,
      country: ad.country_id ? { id: ad.country_id, name: ad.country_name } : null,
    }));

    // ---------------- COUNT QUERY ----------------
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ads a
      JOIN sub_categories s ON s.id = a.subcategory_id
      JOIN categories c ON c.id = s.category_id
      JOIN users u ON u.id = a.user_id
      LEFT JOIN regions r ON r.id = a.region_id
      LEFT JOIN districts d ON d.id = a.district_id
      LEFT JOIN countries cn ON cn.id = r.country_id
      ${whereSQL}
    `;
    const [countRows] = await db.query(countQuery, params);
    const total = (countRows as any)[0]?.total || 0;

    return res.status(200).json({ products: adsWithDetails, total });

  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}