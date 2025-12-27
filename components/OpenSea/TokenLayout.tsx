'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RaribleItem, resolveItemImageUrl } from '@/lib/utils';
import { RaribleCollectionStats, TokenPriceHistory } from '@/lib/RaribleService';
import { OpenSeaNFTData } from '@/lib/OpenSeaService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MoreFromCollection } from './MoreFromCollection';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface OpenSeaTokenLayoutProps {
    item: RaribleItem;
    collectionStats: RaribleCollectionStats;
    priceHistory: TokenPriceHistory;
    openSeaData: OpenSeaNFTData | null;
    ethPrice: number | null;
}

// Helper Components
const Accordion = ({ title, children, defaultOpen = false, icon }: { title: string; children: React.ReactNode; defaultOpen?: boolean; icon?: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border border-gray-700 rounded-xl overflow-hidden mb-4 bg-gray-900/50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 font-semibold text-gray-200 hover:bg-gray-800 transition"
            >
                <div className="flex items-center gap-3">
                    {icon && <span className="text-gray-400">{icon}</span>}
                    <span>{title}</span>
                </div>
                <svg
                    className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && <div className="p-4 border-t border-gray-700 bg-gray-900/30">{children}</div>}
        </div>
    );
};

export function OpenSeaTokenLayout({ item, collectionStats, priceHistory, openSeaData, ethPrice }: OpenSeaTokenLayoutProps) {
    const imageUrl = openSeaData?.image_url || resolveItemImageUrl(item) || item.meta?.content?.[0]?.url || '';
    const mintDate = openSeaData?.minted_at
        ? new Date(openSeaData.minted_at).toLocaleDateString()
        : (priceHistory.mintDate ? new Date(priceHistory.mintDate).toLocaleDateString() : 'Unknown');

    const lastSalePrice = openSeaData?.last_sale
        ? `${parseFloat(openSeaData.last_sale.price.value) / Math.pow(10, openSeaData.last_sale.price.decimals)} ${openSeaData.last_sale.price.currency}`
        : (priceHistory.lastSalePrice ? `${priceHistory.lastSalePrice} ETH` : '---');

    const rank = openSeaData?.rarity?.rank || null;
    const totalSupply = collectionStats.totalSupply || 888; // Default to 888 if unknown

    // Valuation Logic: Prioritize Last Sale -> Floor Price
    const valuation = lastSalePrice !== '---'
        ? { label: 'Last Sale Price', value: lastSalePrice }
        : (collectionStats.floorPrice ? { label: 'Estimated Value (Floor)', value: `${collectionStats.floorPrice.toFixed(4)} ETH` } : { label: 'Unvalued', value: '--- ETH' });

    return (
        <div className="flex flex-col gap-6 min-h-screen text-gray-100 font-sans p-4 lg:p-6 max-w-6xl mx-auto">
            {/* Navigation Bar */}
            <div className="flex items-center justify-between">
                <Link href="/" className="group flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors">
                    <span className="p-2 rounded-full bg-emerald-900/40 group-hover:bg-emerald-900/60 transition">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </span>
                    <span className="font-mono text-sm uppercase tracking-widest opacity-80 group-hover:opacity-100">Mission Control</span>
                </Link>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* LEFT COLUMN: Image & Description */}
                <div className="lg:w-[45%] flex flex-col gap-4">
                    <div className="rounded-xl overflow-hidden border border-gray-700 bg-gray-800 relative aspect-square group shadow-2xl">
                        <div className="absolute top-4 left-4 z-10 flex gap-2">
                            <span className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-white/10">
                                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                                ETHEREUM
                            </span>
                        </div>
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={item.meta?.name || 'NFT Image'}
                                fill
                                className="object-cover transition duration-500 hover:scale-105"
                                unoptimized
                                unoptimized
                                priority
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">No Image Available</div>
                        )}
                    </div>

                    {/* Description Accordion Mobile/Desktop */}
                    <Accordion title="Description" defaultOpen={true} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>}>
                        <div className="text-gray-300 text-sm leading-relaxed">
                            {item.meta?.description || "By TheAlien.888\n\nThe Alien 888 is a collection of unique digital identities on the Ethereum blockchain."}
                        </div>
                        <div className="mt-4 flex flex-col gap-2">
                            <div className="flex justify-between text-sm py-2 border-b border-gray-800">
                                <span className="text-gray-400">Created by</span>
                                <span className="text-emerald-400">TheAlien.888</span>
                            </div>
                        </div>
                    </Accordion>

                    <Accordion title="Properties" defaultOpen={true} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {(openSeaData?.traits || []).map((t, i) => (
                                <div key={i} className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-3 flex flex-col items-center text-center hover:bg-emerald-900/20 transition">
                                    <span className="text-xs uppercase text-emerald-500 font-bold tracking-wider mb-1">{t.trait_type}</span>
                                    <span className="text-sm font-medium text-emerald-100">{t.value}</span>
                                    {/* <span className="text-[10px] text-gray-500 mt-1">12% have this trait</span> - would need rarity data */}
                                </div>
                            ))}
                            {(!openSeaData?.traits || openSeaData.traits.length === 0) && (
                                <div className="col-span-3 text-center text-gray-500 text-sm py-4">No traits found.</div>
                            )}
                        </div>
                    </Accordion>

                    <Accordion title="About TheAlien.888" defaultOpen={false} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-4 items-center">
                                <div className="w-16 h-16 rounded-lg bg-gray-700 overflow-hidden relative">
                                    {/* Collection Image Placeholder */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-purple-600"></div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">TheAlien.888</h4>
                                    <p className="text-xs text-gray-400 max-w-sm">
                                        TheAlien.888 is a unique collection of digital avatars. Verified on Rarible and OpenSea.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 mt-2">
                                <SocialLink href="https://twitter.com" icon="X" />
                                <SocialLink href="https://discord.com" icon="Discord" />
                                <SocialLink href="https://instagram.com" icon="Instagram" />
                                <SocialLink href="https://thealien888.com" icon="Website" />
                            </div>
                        </div>
                    </Accordion>
                </div>

                {/* RIGHT COLUMN: Header & Stats */}
                <div className="lg:w-[55%] flex flex-col">
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Link href={`/collection/${item.contract}`} className="text-emerald-400 hover:text-emerald-300 font-medium text-lg">
                                TheAlien.888
                            </Link>
                            <span className="text-blue-400" title="Verified Collection">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                            </span>
                            {rank && (
                                <span className="ml-auto bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded border border-gray-600 font-mono">
                                    Rank #{rank} / {totalSupply}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl font-extrabold text-white mb-4">{item.meta?.name || `Token #${item.tokenId}`}</h1>

                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-8">
                            <span>Owned by <span className="text-emerald-400 cursor-pointer hover:underline">
                                {item.owners && item.owners.length > 0 ? `${item.owners[0].slice(0, 6)}...${item.owners[0].slice(-4)}` : 'Multiple'}
                            </span></span>
                            <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> 125 views</span>
                            <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> 12 favorites</span>
                        </div>

                        {/* PRICE CARD */}
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8 backdrop-blur-sm">
                            <div className="text-gray-400 text-sm mb-2">{valuation.label}</div>
                            <div className="flex items-end gap-3 mb-6">
                                <div className="text-4xl font-extrabold text-white">{valuation.value}</div>
                                {/* <div className="text-gray-500 mb-1">($0.00)</div> */}
                            </div>
                            <div className="flex gap-3">
                                <button className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-xl transition flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                    Buy now
                                </button>
                                <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-xl border border-gray-600 transition flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                    Make offer
                                </button>
                            </div>
                        </div>

                        {/* STATS GRID */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <StatBox label="Last Sale" value={lastSalePrice} />
                            {/* <StatBox label="Top Offer" value="--- ETH" /> */}
                            <StatBox label="Collection Floor" value={collectionStats.floorPrice ? `${collectionStats.floorPrice.toFixed(4)} ETH` : '---'} />
                            <StatBox label="Total Volume" value={collectionStats.totalVolume ? `${collectionStats.totalVolume.toFixed(2)} ETH` : '---'} />
                        </div>

                        <Accordion title="Details" defaultOpen={false} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span>Contract Address</span>
                                    <a href={`https://etherscan.io/address/${item.contract.split(':')[1] || item.contract}`} target="_blank" className="text-emerald-400 hover:underline font-mono">
                                        {(item.contract.split(':')[1] || item.contract).slice(0, 6)}...{(item.contract.split(':')[1] || item.contract).slice(-4)}
                                    </a>
                                </div>
                                <div className="flex justify-between">
                                    <span>Token ID</span>
                                    <span className="text-gray-300 font-mono">{item.tokenId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Token Standard</span>
                                    <span className="text-gray-300">ERC-721</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Chain</span>
                                    <span className="text-gray-300">Ethereum</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Last Updated</span>
                                    <span className="text-gray-300">Just now</span>
                                </div>
                                <div className="flex justify-between font-bold text-white bg-gray-800 p-2 rounded">
                                    <span>Mint Date</span>
                                    <span>{mintDate}</span>
                                </div>
                            </div>
                        </Accordion>
                    </div>
                </div>
            </div>

            {/* More From Collection Section */}
            <div className="mt-12 pt-8 border-t border-gray-800">
                <h3 className="text-xl font-bold mb-6">More from this collection</h3>
                <MoreFromCollection currentTokenId={item.tokenId} />
            </div>
        </div>
    );
}

const StatBox = ({ label, value }: { label: string; value: string }) => (
    <div className="border border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-800/30">
        <span className="text-xs text-gray-400 uppercase tracking-widest mb-1">{label}</span>
        <span className="text-lg font-bold text-white">{value}</span>
    </div>
);

const SocialLink = ({ href, icon }: { href: string; icon: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition border border-gray-700 text-gray-300">
        {icon}
    </a>
)
