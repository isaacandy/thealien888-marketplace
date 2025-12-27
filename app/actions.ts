'use server';

import {
    fetchCollectionStats,
    fetchTokenPriceHistory,
    RaribleCollectionStats,
    TokenPriceHistory,
    THE_ALIEN_888_COLLECTION_ID,
    fetchAlien888Items
} from '@/lib/RaribleService';
import { RaribleItem } from '@/lib/utils';
import { fetchOpenSeaNFT, OpenSeaNFTData } from '@/lib/OpenSeaService';

/**
 * Server Action to fetch collection stats.
 * This runs on the server, so it can access private API keys if configured.
 */
export async function getCollectionStatsAction(collectionId?: string): Promise<RaribleCollectionStats> {
    const id = collectionId || THE_ALIEN_888_COLLECTION_ID.replace('ETHEREUM:', '');
    try {
        console.log(`[ServerAction] Fetching stats for ${id}`);
        return await fetchCollectionStats(id);
    } catch (error) {
        console.error("[ServerAction] Failed to fetch collection stats:", error);
        return {};
    }
}

/**
 * Server Action to fetch token price history (mint date, last sale).
 */
export async function getTokenHistoryAction(contract: string, tokenId: string): Promise<TokenPriceHistory> {
    try {
        return await fetchTokenPriceHistory(contract, tokenId);
    } catch (error) {
        console.error("[ServerAction] Failed to fetch token history:", error);
        return {};
    }
}

/**
 * Server Action to fetch OpenSea NFT data.
 */
export async function getOpenSeaNFTAction(contract: string, tokenId: string): Promise<OpenSeaNFTData | null> {
    try {
        console.log(`[ServerAction] Fetching OpenSea data for ${contract}:${tokenId}`);
        return await fetchOpenSeaNFT('ethereum', contract, tokenId);
    } catch (error) {
        console.error("[ServerAction] Failed to fetch OpenSea data:", error);
        return null; // Return null on failure so UI can fallback
    }
}

/**
 * Server Action to fetch random items from the collection for "More From This Collection".
 */
export async function fetchMoreFromCollectionAction(size: number = 4): Promise<RaribleItem[]> {
    try {
        // Fetch a batch of items (e.g. 20) and shuffle them, or just fetch recent ones
        // For simplicity and speed, we fetch recent ones for now.
        const result = await fetchAlien888Items({ size: 20 });
        const items = result.items || [];
        
        // Simple shuffle to show variation if we have enough items
        const shuffled = items.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, size);
    } catch (error) {
        console.error("[ServerAction] Failed to fetch more items:", error);
        return [];
    }
}
