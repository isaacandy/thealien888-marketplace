'use server';

import {
    fetchCollectionStats,
    fetchTokenPriceHistory,
    RaribleCollectionStats,
    TokenPriceHistory,
    THE_ALIEN_888_COLLECTION_ID
} from '@/lib/RaribleService';

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
