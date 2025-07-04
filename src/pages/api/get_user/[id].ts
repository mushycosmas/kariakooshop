import { db } from "@/lib/db";
import type { NextApiRequest, NextApiResponse } from "next";

// Handler for GET requests to fetch user by ID
export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // Access the dynamic parameter 'id' from the query

  if (!id || Array.isArray(id)) {
    // If 'id' is not provided or is invalid, return a 400 response
    return res.status(400).json({ message: "Invalid or missing ID" });
  }

  try {
    // Execute DB query to fetch user by ID
    const [rows]: any = await db.execute('SELECT * FROM users WHERE id = ?', [id]);

    // If user is not found, return 404 response
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data if found
    return res.status(200).json({ user: rows[0] });
  } catch (error) {
    console.error('DB error:', error);

    // Return error response if there's a DB issue
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Export the handler as the default export
export default handler;
