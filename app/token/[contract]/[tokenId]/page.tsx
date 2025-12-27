


import { fetchItemById, fetchCollectionStats, fetchTokenPriceHistory, fetchEthPrice, THE_ALIEN_888_COLLECTION_ID } from '../../../../lib/RaribleService';
import { RaribleItem, resolveItemImageUrl } from '../../../../lib/utils';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ProductSchema } from '../../../../components/Schema';
import StarfieldBackground from '../../../../components/StarfieldBackground';
import React from 'react';
import { TokenDetailsView } from './TokenDetailsView';


export default async function TokenPage({ params }: TokenPageProps) {
    const { contract, tokenId } = await params;
    const itemId = `ETHEREUM:${contract}:${tokenId}`;

    // Parallel data fetching for performance
    const [item, collectionStats, priceHistory, ethPrice] = await Promise.all([
        fetchItemById(itemId).catch(() => null),
        fetchCollectionStats(THE_ALIEN_888_COLLECTION_ID.replace('ETHEREUM:', '')),
        fetchTokenPriceHistory(contract, tokenId),
        fetchEthPrice()
    ]);

    if (!item) {
        notFound();
    }

    const imageUrl = resolveItemImageUrl(item) || item.meta?.content?.[0]?.url || '';

    return (
        <main className="relative min-h-screen text-emerald-100 font-sans selection:bg-fuchsia-500/30 overflow-x-hidden">
            <StarfieldBackground />
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Breadcrumbs / Back */}
                <div className="mb-6 flex items-center justify-between">
                    <Link href="/" className="group flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors">
                        <span className="p-2 rounded-full bg-emerald-900/40 group-hover:bg-emerald-900/60 transition">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </span>
                        <span className="font-mono text-sm uppercase tracking-widest opacity-80 group-hover:opacity-100">Return to Mission Control</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left Column: Image & visuals */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-emerald-500/20 bg-gray-900/50 shadow-[0_0_50px_rgba(16,185,129,0.15)] group">
                            {imageUrl ? (
                                <Image
                                    src={imageUrl}
                                    alt={item.meta?.name || 'NFT Image'}
                                    fill
                                    className="object-cover transition duration-700 group-hover:scale-110 group-hover:brightness-110"
                                    unoptimized
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-emerald-500/40 font-mono text-sm">
                                    [NO VISUAL SIGNAL DETECTED]
                                </div>
                            )}
                            {/* Overlay Shine */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/0 via-white/5 to-fuchsia-500/0 opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none" />
                        </div>

                        {/* Quick Actions (visible on mobile stack usually, but good here too) */}
                        <div className="grid grid-cols-2 gap-4">
                            <a
                                href={`https://rarible.com/token/${item.contract.replace('ETHEREUM:', '')}:${item.tokenId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-800/80 hover:bg-emerald-900/50 border border-emerald-500/20 text-emerald-200 hover:text-white transition font-semibold text-sm backdrop-blur-sm"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                                View on Rarible
                            </a>
                            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-fuchsia-900/40 hover:bg-fuchsia-800/60 border border-fuchsia-500/20 text-fuchsia-200 hover:text-white transition font-semibold text-sm backdrop-blur-sm">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                Share
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Details & Tabs */}
                    <div className="lg:col-span-7 flex flex-col">
                        <ProductSchema item={item} />

                        {/* Header */}
                        <div className="mb-8 p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-emerald-500/10 shadow-xl">
                            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">
                                <span className="px-2 py-1 rounded bg-emerald-950/50 border border-emerald-500/20">TheAlien.888</span>
                                <span className="flex items-center gap-1 text-emerald-200">
                                    <svg className="w-3 h-3 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                                    Verified
                                </span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-emerald-100 via-white to-emerald-200 bg-clip-text text-transparent mb-4">
                                {item.meta?.name || `Token #${item.tokenId}`}
                            </h1>

                            {/* Ownership / Stats Row */}
                            <div className="flex flex-wrap items-center gap-6 mt-4">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">Owner</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600"></div>
                                        <span className="font-mono text-sm text-emerald-100">
                                            {item.owners && item.owners.length > 0 ? `${item.owners[0].slice(0, 6)}...${item.owners[0].slice(-4)}` : 'Multiple / Unknown'}
                                        </span>
                                    </div>
                                </div>
                                <div className="h-8 w-px bg-gray-800"></div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">Collection Floor</p>
                                    <p className="font-mono text-sm text-emerald-100">
                                        {collectionStats.floorPrice ? `${collectionStats.floorPrice.toFixed(4)} ETH` : '---'}
                                    </p>
                                </div>
                                <div className="h-8 w-px bg-gray-800"></div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">Highest Sale</p>
                                    <p className="font-mono text-sm text-fuchsia-200">
                                        {collectionStats.highestSale ? `${collectionStats.highestSale.toFixed(2)} ETH` : '---'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Client View (Tabs) */}
                        <div className="flex-1 min-h-[500px] rounded-2xl bg-black/40 backdrop-blur-md border border-emerald-500/10 shadow-xl overflow-hidden">
                            <TokenDetailsView
                                item={item}
                                collectionStats={collectionStats}
                                priceHistory={priceHistory}
                                ethPrice={ethPrice}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
