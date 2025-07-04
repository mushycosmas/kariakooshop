import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Handler for GET requests
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } } // Typing for dynamic route params
) {
  const { id } = params;

  try {
    // Execute DB query
    const [rows]: any = await db.execute('SELECT * FROM users WHERE id = ?', [id]);

    // If user is not found
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // If user found, return the user data
    return NextResponse.json(
      { user: rows[0] },
      { status: 200, headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=30' } }
    );
  } catch (error) {
    console.error('DB error:', error);

    // Return error response
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
