


import { fetchItemById, THE_ALIEN_888_COLLECTION_ID, fetchEthPrice } from '../../../../lib/RaribleService';
import { getCollectionStatsAction, getTokenHistoryAction, getOpenSeaNFTAction } from '../../../../app/actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import { OpenSeaTokenLayout } from '../../../../components/OpenSea/TokenLayout';


export default async function TokenPage({ params }: TokenPageProps) {
    const { contract, tokenId } = await params;
    const itemId = `ETHEREUM:${contract}:${tokenId}`;

    // Parallel data fetching for performance, now strictly Server Actions or Services
    // We use the Service explicitly here if preferred, or actions. 
    // Since we are in a Server Component, direct Service calls are fine and efficient.
    const [item, collectionStats, priceHistory, ethPrice, openSeaData] = await Promise.all([
        fetchItemById(itemId).catch(() => null),
        getCollectionStatsAction(THE_ALIEN_888_COLLECTION_ID.replace('ETHEREUM:', '')),
        getTokenHistoryAction(contract, tokenId),
        fetchEthPrice(),
        getOpenSeaNFTAction(contract, tokenId)
    ]);

    if (!item) {
        notFound();
    }

    return (
        <main className="bg-gray-900 min-h-screen">
            <OpenSeaTokenLayout
                item={item}
                collectionStats={collectionStats}
                priceHistory={priceHistory}
                openSeaData={openSeaData}
                ethPrice={ethPrice}
            />
        </main>
    );
}
