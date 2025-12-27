import { RaribleItem } from './utils';

const OPENSEA_API_KEY = '6eb6eeef615641b8ba0b4217a5192aec'; // User provided reliable key
const OPENSEA_BASE_URL = 'https://api.opensea.io/api/v2';

export interface OpenSeaNFTData {
    identifier: string;
    collection: string;
    contract: string;
    token_standard?: string;
    name?: string;
    description?: string;
    image_url?: string;
    owners?: { address: string; quantity: number }[];
    rarity?: { rank: number; max_rank?: number; strategy_version?: string };
    traits?: { trait_type: string; value: string | number; display_type?: string; max_value?: number }[];
    last_sale?: {
        event_timestamp: string;
        price: { value: string; currency: string; decimals: number };
        transaction?: string;
    };
    minted_at?: string; // Often implied from events
}

export async function fetchOpenSeaNFT(chain: string, address: string, tokenId: string): Promise<OpenSeaNFTData | null> {
    try {
        const chainName = chain === 'ETHEREUM' ? 'ethereum' : chain.toLowerCase();
        // Endpoint: Get NFT
        const url = `${OPENSEA_BASE_URL}/chain/${chainName}/contract/${address}/nfts/${tokenId}`;

        const res = await fetch(url, {
            headers: {
                'x-api-key': OPENSEA_API_KEY,
                'accept': 'application/json'
            },
            next: { revalidate: 60 } // Cache for 60s
        });

        if (!res.ok) {
            console.error(`[OpenSea] Error ${res.status}: ${res.statusText}`);
            return null;
        }

        const data = await res.json();
        return data.nft || data; // API structure varies sometimes
    } catch (error) {
        console.error("[OpenSea] Fetch failed:", error);
        return null;
    }
}
