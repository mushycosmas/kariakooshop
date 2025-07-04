import { db } from "@/lib/db";
import { NextRequest } from "next/server";

// ✅ This is the proper typing for context in route handlers
type Context = {
  params: {
    id: string;
  };
};

export async function GET(
  req: NextRequest,
  { params }: Context
) {
  const { id } = params;

  try {
    const [rows]: any = await db.execute(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    if (!rows || rows.length === 0) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    return new Response(JSON.stringify({ user: rows[0] }), {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("DB error:", error);

    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
}
