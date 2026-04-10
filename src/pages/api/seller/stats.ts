import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../lib/db"; // adjust this path to your db connection

type StatsResponse = {
  totalAds: number;
  totalViews: number;
  totalMessages: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatsResponse | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sellerId = req.query.sellerId;

  if (!sellerId) {
    return res.status(400).json({ error: "sellerId is required" });
  }

  try {
    // Fetch total ads and total views
    const [ads]: any = await db.query(
      "SELECT COUNT(*) as totalAds, IFNULL(SUM(viewed ),0) as totalViews FROM ads WHERE user_id = ?",
      [sellerId]
    );

    // Fetch total messages
    const [messages]: any = await db.query(
      "SELECT COUNT(*) as totalMessages FROM messages WHERE  sender_id = ?",
      [sellerId]
    );

    const stats: StatsResponse = {
      totalAds: ads[0]?.totalAds || 0,
      totalViews: ads[0]?.totalViews || 0,
      totalMessages: messages[0]?.totalMessages || 0,
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}