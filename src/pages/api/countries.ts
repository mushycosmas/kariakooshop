import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db';
import { RowDataPacket } from 'mysql2';

interface CountryRow extends RowDataPacket {
  country_id: number;
  country_name: string;
  country_code: string | null;
  region_id: number | null;
  region_name: string | null;
  district_id: number | null;
  district_name: string | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const [rows] = await db.query<CountryRow[]>(`
      SELECT 
        c.id AS country_id,
        c.name AS country_name,
        c.code AS country_code,
        r.id AS region_id,
        r.name AS region_name,
        d.id AS district_id,
        d.name AS district_name
      FROM countries c
      LEFT JOIN regions r ON r.country_id = c.id
      LEFT JOIN districts d ON d.region_id = r.id
      ORDER BY c.id, r.id, d.id;
    `);

    // Structure: Country → Region → District
    const countryMap = new Map<string, {
      id: string;
      name: string;
      code: string | null;
      regions: {
        id: string;
        name: string;
        districts: { id: string; name: string }[];
      }[];
    }>();

    rows.forEach((row) => {
      const countryId = row.country_id.toString();

      // Create country if not exists
      if (!countryMap.has(countryId)) {
        countryMap.set(countryId, {
          id: countryId,
          name: row.country_name,
          code: row.country_code,
          regions: []
        });
      }

      const country = countryMap.get(countryId)!;

      // Handle region
      if (row.region_id) {
        const regionId = row.region_id.toString();

        let region = country.regions.find(r => r.id === regionId);

        if (!region) {
          region = {
            id: regionId,
            name: row.region_name!,
            districts: []
          };
          country.regions.push(region);
        }

        // Handle district (avoid duplicates)
        if (row.district_id) {
          const districtId = row.district_id.toString();

          const exists = region.districts.find(d => d.id === districtId);

          if (!exists) {
            region.districts.push({
              id: districtId,
              name: row.district_name!
            });
          }
        }
      }
    });

    const countries = Array.from(countryMap.values());

    res.status(200).json(countries);

  } catch (error) {
    console.error('Error fetching countries/regions/districts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load location data'
    });
  }
}