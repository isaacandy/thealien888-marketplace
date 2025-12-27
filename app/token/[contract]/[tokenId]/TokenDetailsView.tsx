'use client';

import React, { useState } from 'react';
import { RaribleItem } from '../../../../lib/utils';
import { RaribleActivity } from '../../../../components/RaribleActivity';
import { RaribleCollectionStats, TokenPriceHistory } from '../../../../lib/RaribleService';

interface TokenDetailsViewProps {
    item: RaribleItem;
    collectionStats: RaribleCollectionStats;
    priceHistory: TokenPriceHistory;
    ethPrice: number;
}

type TabType = 'general' | 'traits' | 'activity' | 'bids';

export function TokenDetailsView({ item, collectionStats, priceHistory, ethPrice }: TokenDetailsViewProps) {
    const [activeTab, setActiveTab] = useState<TabType>('general');

    const contract = item.contract.replace(/^ETHEREUM:/i, '');
    const tokenId = item.tokenId;

    // Helper to format currency
    const formatCurrency = (ethValue?: number) => {
        if (ethValue === undefined || ethValue === 0) return '---';
        const usdValue = ethValue * ethPrice;
        return {
            eth: `${ethValue.toFixed(4)} ETH`,
            usd: `$${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        };
    };

    const boughtFor = formatCurrency(priceHistory.lastSalePrice);
    const floorPrice = formatCurrency(collectionStats.floorPrice);

    return (
        <div className="flex flex-col h-full">
            {/* Tabs Header */}
            <div className="flex border-b border-emerald-500/10 bg-black/20">
                <TabButton
                    isActive={activeTab === 'general'}
                    onClick={() => setActiveTab('general')}
                    label="General Info"
                />
                <TabButton
                    isActive={activeTab === 'traits'}
                    onClick={() => setActiveTab('traits')}
                    label="Properties"
                    count={item.meta?.attributes?.length}
                />
                <TabButton
                    isActive={activeTab === 'activity'}
                    onClick={() => setActiveTab('activity')}
                    label="History"
                />
                <TabButton
                    isActive={activeTab === 'bids'}
                    onClick={() => setActiveTab('bids')}
                    label="Bids"
                />
            </div>

            {/* Tab Content */}
            <div className="p-6 flex-1 bg-gradient-to-b from-transparent to-black/20">

                {/* GENERAL TAB */}
                {activeTab === 'general' && (
                    <div className="space-y-8 animate-in fade-in duration-500">

                        {/* 1. Valuation Cards (MetaMask Style) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ValuationCard
                                title="Bought For"
                                eth={typeof boughtFor === 'object' ? boughtFor.eth : '---'}
                                usd={typeof boughtFor === 'object' ? boughtFor.usd : '---'}
                                highlight={false}
                            />
                            <ValuationCard
                                title="Current Floor Price"
                                eth={typeof floorPrice === 'object' ? floorPrice.eth : '---'}
                                usd={typeof floorPrice === 'object' ? floorPrice.usd : '---'}
                                highlight={true}
                            />
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-3">Description</h3>
                            <div className="prose prose-invert prose-sm max-w-none text-emerald-100/80 leading-relaxed bg-black/30 p-4 rounded-xl border border-emerald-500/10">
                                {item.meta?.description || 'No description available for this cosmic entity.'}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-3">Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DetailRow label="Contract" value={contract} copy />
                                <DetailRow label="Token ID" value={tokenId} copy />
                                <DetailRow label="Token Standard" value="ERC-721" />
                                <DetailRow label="Blockchain" value="Ethereum" />
                                <DetailRow label="Date Created" value={priceHistory.mintDate ? new Date(priceHistory.mintDate).toLocaleDateString() : 'Unknown'} />
                            </div>
                        </div>
                    </div>
                )}

                {/* TRAITS TAB */}
                {activeTab === 'traits' && (
                    <div className="animate-in fade-in duration-500">
                        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-4">
                            Attributes ({item.meta?.attributes?.length || 0})
                        </h3>
                        {item.meta?.attributes && item.meta.attributes.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {item.meta.attributes.map((attr, idx) => (
                                    <div key={idx} className="bg-emerald-900/10 border border-emerald-500/20 p-3 rounded-lg flex flex-col items-center text-center hover:bg-emerald-900/20 transition group">
                                        <span className="text-[10px] uppercase tracking-wider text-emerald-500/70 mb-1 group-hover:text-emerald-400 transition">{attr.key}</span>
                                        <span className="font-semibold text-emerald-100 text-sm">{attr.value}</span>
                                        {/* Rarity placeholder */}
                                        {/* <span className="text-[10px] text-fuchsia-400/60 mt-1">12% have this</span> */}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-emerald-500/40 italic">
                                No traits data found within the metadata stream.
                            </div>
                        )}
                    </div>
                )}

                {/* ACTIVITY TAB */}
                {activeTab === 'activity' && (
                    <div className="animate-in fade-in duration-500 h-full">
                        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-4">
                            Recent Network Activity
                        </h3>
                        <div className="bg-black/30 rounded-xl p-1 border border-emerald-500/10">
                            <RaribleActivity contract={contract} tokenId={tokenId} />
                        </div>
                    </div>
                )}

                {/* BIDS TAB */}
                {activeTab === 'bids' && (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                            <div className="p-4 rounded-full bg-emerald-900/20 text-emerald-500">
                                <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-emerald-200 font-semibold mb-1">No Active Bids</h3>
                                <p className="text-sm text-emerald-500/60 max-w-xs mx-auto">
                                    There are no open offers for this entity on the Rarible protocol at this moment.
                                </p>
                            </div>
                            <a
                                href={`https://rarible.com/token/${contract}:${tokenId}`}
                                target="_blank"
                                className="text-xs text-fuchsia-400 hover:text-fuchsia-300 border-b border-fuchsia-400/30 pb-0.5 transition"
                            >
                                Place a bid on Rarible
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function TabButton({ isActive, onClick, label, count }: { isActive: boolean; onClick: () => void; label: string; count?: number }) {
    return (
        <button
            onClick={onClick}
            className={`
                flex-1 py-4 px-4 text-sm font-semibold tracking-wide transition-all relative
                ${isActive ? 'text-white' : 'text-emerald-500/50 hover:text-emerald-200'}
            `}
        >
            <div className="flex items-center justify-center gap-2 relative z-10">
                {label}
                {count !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-fuchsia-600 text-white' : 'bg-emerald-900/40 text-emerald-500'}`}>
                        {count}
                    </span>
                )}
            </div>
            {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-fuchsia-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            )}
            {isActive && (
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
            )}
        </button>
    );
}


function ValuationCard({ title, eth, usd, highlight }: { title: string; eth: string; usd: string; highlight?: boolean }) {
    return (
        <div className={`
            relative p-5 rounded-xl border flex flex-col items-center justify-center text-center overflow-hidden group
            ${highlight
                ? 'bg-gradient-to-br from-emerald-900/40 to-black/60 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                : 'bg-black/30 border-emerald-500/10 hover:border-emerald-500/20'}
        `}>
            <span className="text-xs uppercase tracking-widest text-emerald-500/70 mb-2">{title}</span>
            <div className="flex flex-col">
                <span className={`text-2xl font-bold font-mono ${highlight ? 'text-white' : 'text-emerald-100'}`}>
                    {usd}
                </span>
                <span className="text-sm font-mono text-emerald-500/50 mt-1">
                    {eth}
                </span>
            </div>
            {highlight && (
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/0 via-emerald-400/5 to-transparent pointer-events-none"></div>
            )}
        </div>
    );
}

function DetailRow({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
    return (
        <div className="flex flex-col p-3 rounded-lg bg-black/20 border border-emerald-500/10">
            <span className="text-[10px] uppercase tracking-wider text-emerald-500/60 mb-1">{label}</span>
            <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-emerald-100 truncate pr-2" title={value}>
                    {value}
                </span>
                {copy && (
                    <button
                        className="text-emerald-500/40 hover:text-emerald-300 transition"
                        title="Copy to clipboard"
                        onClick={() => navigator.clipboard.writeText(value)}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                )}
            </div>
        </div>
    );
}
