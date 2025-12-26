

import { fetchItemById } from '../../../../lib/RaribleService';
import { RaribleItem, resolveItemImageUrl } from '../../../../lib/utils';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ProductSchema } from '../../../../components/Schema';
import RaribleActivity from '../../../../components/RaribleActivity';
import React from 'react';

type TokenPageProps = {
    params: {
        contract: string;
        tokenId: string;
    };
};

export default async function TokenPage({ params }: TokenPageProps) {
    const { contract, tokenId } = params;
    const itemId = `ETHEREUM:${contract}:${tokenId}`;
    let item: RaribleItem;

    try {
        item = await fetchItemById(itemId);
    } catch (error) {
        console.error(error);
        notFound();
    }

    const imageUrl = resolveItemImageUrl(item) || item.meta?.content?.[0]?.url || '';

    // Trading actions placeholder (actual trading actions require client-side wallet connection)
    // For SSR, show info and activity; for trading, direct user to connect wallet on client

    return (
        <>
            <ProductSchema item={item} />
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={item.meta?.name || 'NFT Image'}
                                width={500}
                                height={500}
                                className="rounded-lg shadow-[0_0_30px_rgba(52,211,153,0.8)]"
                                unoptimized
                            />
                        ) : (
                            <div className="w-[500px] h-[500px] flex items-center justify-center bg-emerald-950/40 text-xs text-emerald-200/60 rounded-lg">
                                No preview
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-emerald-100 mb-2 drop-shadow-lg">{item.meta?.name || `Token #${item.tokenId}`}</h1>
                        <p className="text-emerald-200 mb-4 text-lg whitespace-pre-line">{item.meta?.description || ''}</p>
                        <div className="space-y-2 mb-4">
                            <p><span className="font-semibold text-fuchsia-400">Contract:</span> <span className="font-mono text-emerald-300">{item.contract}</span></p>
                            <p><span className="font-semibold text-fuchsia-400">Token ID:</span> <span className="font-mono text-emerald-300">{item.tokenId}</span></p>
                            <p><span className="font-semibold text-fuchsia-400">Blockchain:</span> <span className="font-mono text-emerald-300">{item.blockchain}</span></p>
                        </div>
                        <div className="flex flex-col gap-3 mb-6">
                            <a
                                href={`https://rarible.com/token/${item.contract.replace('ETHEREUM:', '')}:${item.tokenId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg bg-fuchsia-700/80 px-4 py-2 text-center text-sm font-semibold text-white shadow-[0_0_15px_rgba(232,121,249,0.5)] hover:bg-fuchsia-600 transition"
                            >
                                View on Rarible (Verified)
                            </a>
                            {/* Trading actions: these should be client-side, so show info and link to marketplace */}
                            <a
                                href="/"
                                className="rounded-lg bg-emerald-700/80 px-4 py-2 text-center text-sm font-semibold text-white shadow-[0_0_15px_rgba(52,211,153,0.5)] hover:bg-emerald-600 transition"
                            >
                                Go to Marketplace (Buy, Sell, Offer)
                            </a>
                        </div>
                        <div className="mt-4">
                            <h2 className="text-lg font-bold text-fuchsia-300 mb-2">Activity History</h2>
                            <RaribleActivity contract={item.contract.replace(/^ethereum:/i, "")} tokenId={item.tokenId} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
