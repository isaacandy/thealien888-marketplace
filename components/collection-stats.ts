// pages/api/opensea/collection-stats.ts

import type { NextApiRequest, NextApiResponse } from 'next';

// Define a type for the expected stats data for better type-safety
interface CollectionStats {
  total_supply: number;
  num_owners: number;
  floor_price: number;
  total_volume: number;
  one_day_change: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CollectionStats | { error: string }>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY;
  if (!OPENSEA_API_KEY) {
    console.error("Server Error: OPENSEA_API_KEY is not set in environment variables.");
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const collectionSlug = 'thealien888';
  const url = `https://api.opensea.io/api/v2/collections/${collectionSlug}/stats`;

  const options = {
    method: 'GET',
    headers: { 'accept': 'application/json', 'X-API-KEY': OPENSEA_API_KEY },
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `OpenSea API Error: ${response.statusText}`);
    }
    const stats: CollectionStats = await response.json();
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200'); // Cache for 10 mins
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Internal Server Error fetching OpenSea stats:', error);
    return res.status(500).json({ error: (error as Error).message || 'An internal server error occurred.' });
  }
}
