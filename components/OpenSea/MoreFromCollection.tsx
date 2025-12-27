'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RaribleItem, resolveItemImageUrl } from '@/lib/utils';
import { fetchMoreFromCollectionAction } from '@/app/actions';

export function MoreFromCollection({ currentTokenId }: { currentTokenId: string }) {
    const [items, setItems] = useState<RaribleItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const data = await fetchMoreFromCollectionAction(5);
                // Filter out current token
                const filtered = data.filter(i => i.tokenId !== currentTokenId).slice(0, 4);
                setItems(filtered);
            } catch (e) {
                console.error("Failed to load more items", e);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, [currentTokenId]);

    if (loading) {
        return <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-800 rounded-xl"></div>
            ))}
        </div>;
    }

    if (items.length === 0) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item) => {
                const imageUrl = resolveItemImageUrl(item) || item.meta?.content?.[0]?.url || '';
                return (
                    <Link
                        key={item.id}
                        href={`/token/${item.contract}/${item.tokenId}`}
                        className="group bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:shadow-lg hover:border-emerald-500/50 transition"
                    >
                        <div className="relative aspect-square overflow-hidden bg-gray-900">
                            {imageUrl ? (
                                <Image
                                    src={imageUrl}
                                    alt={item.meta?.name || 'NFT'}
                                    fill
                                    className="object-cover transition duration-300 group-hover:scale-110"
                                    unoptimized
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-600 text-xs">No Image</div>
                            )}
                        </div>
                        <div className="p-3">
                            <h4 className="font-bold text-gray-200 text-sm truncate">{item.meta?.name || `Token #${item.tokenId}`}</h4>
                            <div className="text-xs text-gray-400 mt-1">TheAlien.888</div>
                        </div>
                    </Link>
                )
            })}
        </div>
    );
}
