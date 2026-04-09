import { useEffect, useState } from "react";

interface District {
  id: string;
  name: string;
}

interface Region {
  id: string;
  name: string;
  districts: District[];
}

interface Country {
  id: string;
  name: string;
  code: string | null;
  regions: Region[];
}

export function useLocations() {
  const [data, setData] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/countries");

      if (!res.ok) {
        throw new Error("Failed to fetch locations");
      }

      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return {
    countries: data,
    loading,
    error,
    refetch: fetchLocations,
  };
}