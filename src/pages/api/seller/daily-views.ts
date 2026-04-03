import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../lib/db";

type ViewData = {
  date: string;
  views: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ViewData[] | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sellerId = Number(req.query.sellerId);
  const range = req.query.range || "daily";

  if (!sellerId || isNaN(sellerId)) {
    return res.status(400).json({ error: "Valid sellerId is required" });
  }

  try {
    let query = "";
    let format = "";

    // 🔥 Choose grouping based on range
    if (range === "weekly") {
      query = `
        SELECT 
          YEAR(created_at) as year,
          WEEK(created_at) as week,
          SUM(viewed) as views
        FROM ads
        WHERE user_id = ?
        GROUP BY year, week
        ORDER BY year, week ASC
      `;
    } else if (range === "monthly") {
      query = `
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as date,
          SUM(viewed) as views
        FROM ads
        WHERE user_id = ?
        GROUP BY date
        ORDER BY date ASC
      `;
    } else {
      // default daily
      query = `
        SELECT 
          DATE(created_at) as date,
          SUM(viewed) as views
        FROM ads
        WHERE user_id = ?
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) ASC
      `;
    }

    const [rows]: any = await db.query(query, [sellerId]);

    let formattedData: ViewData[] = [];

    // 🔥 Format weekly nicely
    if (range === "weekly") {
      formattedData = rows.map((row: any) => ({
        date: `Week ${row.week}`,
        views: row.views || 0,
      }));
    } else {
      formattedData = rows.map((row: any) => ({
        date: row.date,
        views: row.views || 0,
      }));
    }

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Daily Views API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}