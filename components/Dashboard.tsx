'use client';

import React, { useEffect, useState } from 'react';
import { RaribleCollectionStats } from '@/lib/RaribleService';
import { getCollectionStatsAction } from '@/app/actions';
import Link from 'next/link';

export function Dashboard() {
    const [stats, setStats] = useState<RaribleCollectionStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        async function loadStats() {
            try {
                const data = await getCollectionStatsAction();
                if (mounted) setStats(data);
            } catch (err) {
                console.error("Dashboard stats error:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        loadStats();
        return () => { mounted = false; };
    }, []);

    if (loading) {
        return (
            <div className="w-full bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/10 animate-pulse">
                <div className="h-20 bg-emerald-900/20 rounded-lg"></div>
            </div>
        );
    }

    // Format helper
    const formatEth = (val?: number) => val ? `${val.toFixed(3)} ETH` : '---';
    const formatNum = (val?: number) => val ? val.toLocaleString() : '---';

    return (
        <div className="w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {/* Total Minted */}
                <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-md border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1">Total Minted</span>
                    <span className="text-2xl font-bold text-white tracking-tight">{formatNum(stats?.totalMinted)}</span>
                    <span className="text-[10px] text-emerald-500/50 mt-1">Lifetime Supply</span>
                </div>

                {/* Floor Price */}
                <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-md border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1">Floor Price</span>
                    <span className="text-2xl font-bold text-emerald-100 tracking-tight">{formatEth(stats?.floorPrice)}</span>
                    <span className="text-[10px] text-emerald-500/50 mt-1">Current Low</span>
                </div>

                {/* Total Volume */}
                <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-md border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <span className="text-xs font-mono text-fuchsia-400 uppercase tracking-widest mb-1">Total Volume</span>
                    <span className="text-2xl font-bold text-white tracking-tight">{formatEth(stats?.totalVolume)}</span>
                    <span className="text-[10px] text-fuchsia-500/50 mt-1">Lifetime Traded</span>
                </div>

                {/* Highest Sale */}
                <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-md border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <span className="text-xs font-mono text-fuchsia-400 uppercase tracking-widest mb-1">Highest Sale</span>
                    <span className="text-2xl font-bold text-emerald-100 tracking-tight">{formatEth(stats?.highestSale)}</span>
                    <span className="text-[10px] text-fuchsia-500/50 mt-1">Record Price</span>
                </div>
            </div>

            {/* Minting / Actions Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-black to-fuchsia-950 border border-emerald-500/30 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 bg-center"></div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-extrabold text-white mb-2">Join the Alien Collection</h3>
                    <p className="text-emerald-200 text-sm max-w-md">
                        Mint your unique Alien.888 identity or subdomain directly on-chain.
                        Be part of the future of Web3 identity.
                    </p>
                </div>
                <div className="relative z-10 flex gap-4">
                    <Link href="#identity" className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] transition transform hover:scale-105">
                        Claim Identity
                    </Link>
                    <Link href="https://rarible.com/collection/ethereum/0x295a6a847e3715f224826aa88156f356ac523eef/items" target="_blank" className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-emerald-100 font-semibold border border-emerald-500/20 transition">
                        View on Rarible
                    </Link>
                </div>
            </div>
        </div>
    );
}
