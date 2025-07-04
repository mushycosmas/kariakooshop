import { db } from "@/lib/db";

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ message: 'User not found' }),
        {
          status: 404,
          headers: {
            'Cache-Control': 'no-store', // Don't cache not found errors
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ user: rows[0] }),
      {
        status: 200,
        headers: {
          // Cache for 60 seconds in browser and CDN, allow stale while revalidating for 30 seconds
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('DB error:', error);

    return new Response(
      JSON.stringify({ message: 'Internal Server Error' }),
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store', // Don't cache errors
        },
      }
    );
  }
}
