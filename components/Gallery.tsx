"use client";
import { useAccount, useWalletClient } from "wagmi";
import { RaribleItem, resolveItemImageUrl } from "@/lib/utils";
import Image from "next/image";
import Link from 'next/link';
import { RaribleActivity } from "./RaribleActivity";
import { createSellOrder, createBidOrder } from "@/lib/RaribleService";
import { useRouter } from 'next/navigation';

interface Bid {
  maker?: string;
  from?: string;
  price?: number;
  value?: number;
  date?: string;
}

import React, { useState, useEffect } from "react";

type ViewMode = "my-collection" | "all-collection";
type ActionType = "sell" | "bid" | "offer";

const GALLERY_API = "/api/rarible/alien888-owned";
const ALL_COLLECTION_API = "/api/rarible/alien888-collection";

const TradeModal = ({
  action,
  onClose,
  onSubmit,
}: {
  action: ActionType;
  onClose: () => void;
  onSubmit: (price: number) => void;
}) => {
  const [price, setPrice] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(price);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">
          {action === "sell"
            ? "List for Sale"
            : action === "bid"
              ? "Place a Bid"
              : "Make an Offer"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="price" className="block text-sm font-medium">
              Price (ETH)
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="mt-1 block w-full rounded-md bg-gray-800 focus:ring-emerald-500"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-black/60"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-black/60"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Gallery: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const connected = isConnected; // Use only standard wagmi hooks and RaribleService for wallet and NFT actions
  const router = useRouter();

  const handleViewDetails = (item: any) => {
    // item.id is in the format 'ETHEREUM:0x...:tokenId'
    const parts = item.id.split(':');
    if (parts.length === 3) {
      const contract = parts[1];
      const tokenId = parts[2];
      router.push(`/token/${contract}/${tokenId}`);
    }
  };

  const [viewMode, setViewMode] = useState<ViewMode>("all-collection");
  const [items, setItems] = useState<RaribleItem[]>([]);
  const [allItems, setAllItems] = useState<RaribleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<RaribleItem | null>(null);
  const [action, setAction] = useState<ActionType | null>(null);

  // Fetch user's NFTs
  useEffect(() => {
    if (!address || !connected) {
      setItems([]);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    async function loadMine() {
      try {
        console.log('Gallery: fetching my collection items for address:', address);
        const params = new URLSearchParams({ owner: address || '', size: "50" });
        const res = await fetch(`${GALLERY_API}?${params.toString()}`, { signal: controller.signal });
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Gallery: error fetching from backend API", errorData);
          throw new Error(`Failed to fetch your NFTs: ${errorData.detail || `API Error ${res.status}`}`);
        }
        const data: { items: RaribleItem[] } = await res.json();
        console.log('Gallery: raw data from my collection API:', data);
        setItems(data.items ?? []);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Gallery: error fetching my collection items:', err);
          setError(err.message || "Failed to load your NFTs");
        }
      } finally {
        setLoading(false);
      }
    }
    loadMine();
    return () => {
      controller.abort();
    };
  }, [address, connected]);

  // Fetch all collection NFTs (for All Collection tab)
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    async function loadAll() {
      try {
        console.log('Gallery: fetching all collection items');
        const res = await fetch(`${ALL_COLLECTION_API}?size=50`, { signal: controller.signal });
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Gallery: error fetching from backend API", errorData);
          throw new Error(`Failed to fetch collection: ${errorData.detail || `API Error ${res.status}`}`);
        }
        const data: { items: RaribleItem[] } = await res.json();
        console.log('Gallery: raw data from all collection API:', data);
        setAllItems(data.items ?? []);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Gallery: error fetching all collection items:', err);
          setError(err.message || 'Failed to load all collection NFTs');
        }
      } finally {
        setLoading(false);
      }
    }
    loadAll();
    return () => {
      controller.abort();
    };
  }, []);

  const handleAction = async (price: number) => {
    if (!selectedItem || !action || !walletClient) return;

    try {
      let orderId;
      if (action === "sell") {
        orderId = await createSellOrder(walletClient, selectedItem.id, price);
      } else if (action === "bid") {
        orderId = await createBidOrder(walletClient, selectedItem.id, price);
      } else {
        // Handle "offer" case if necessary
        return;
      }
      console.log("Order created:", orderId);
      setSelectedItem(null);
      setAction(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unknown error occurred";
      setError(msg || `Failed to ${action}`);
    }
  };

  const isMyCollection = viewMode === "my-collection";
  const nftsToShow = isMyCollection ? items : allItems;

  return (
    <div className="mt-10">
      {selectedItem && action && (
        <TradeModal
          action={action}
          onClose={() => {
            setSelectedItem(null);
            setAction(null);
          }}
          onSubmit={handleAction}
        />
      )}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-200 drop-shadow-lg tracking-tight">TheAlien.888 NFT Marketplace</h1>
        <p className="mt-3 text-gray-300 text-lg max-w-2xl mx-auto">
          Welcome to the official TheAlien.888 NFT marketplace on Ethereum. Here you can browse, buy, sell, and manage your unique Alien.888 NFTs. Connect your wallet to see your collection, list NFTs for sale, or make offers. All trades are powered by the Rarible Protocol for security and transparency.
        </p>
        <div className="mt-4 text-gray-400 text-sm flex items-center justify-center gap-2">
          <span className="font-mono">Collection ID:</span> <span className="font-mono text-gray-300">ETHEREUM:0x295a6a847e3715f224826aa88156f356ac523eef</span>
        </div>
      </header>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg font-bold text-white bg-black/60 px-2 py-1 rounded-t">NFT Command Center</span>
        <span className="ml-auto text-xs font-mono text-emerald-300 bg-gray-900 px-2 py-0.5 rounded">Status: Live Data</span>
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
      </div>
      <div className="mb-6 flex gap-2 pb-2 justify-center">
        <button
          onClick={() => setViewMode("my-collection")}
          className={`rounded-t-lg px-4 py-2 text-base font-semibold transition focus:outline-none focus:ring-2 focus:ring-black/60 ${viewMode === "my-collection"
            ? "bg-gray-800 text-white"
            : "text-gray-400 hover:bg-gray-800/50"
            }`}
        >
          My Collection ({items.length})
        </button>
        <button
          onClick={() => setViewMode("all-collection")}
          className={`rounded-t-lg px-4 py-2 text-base font-semibold transition focus:outline-none focus:ring-2 focus:ring-black/60 ${viewMode === "all-collection"
            ? "bg-gray-800 text-white"
            : "text-gray-400 hover:bg-gray-800/50"
            }`}
        >
          All Collection
        </button>
      </div>
      <div className="mb-4 rounded-lg bg-gray-900/50 p-4 text-sm text-gray-400 max-w-2xl mx-auto">
        {isMyCollection ? (
          <>
            <span className="font-semibold text-gray-200">Your TheAlien.888 Collection:</span> View and manage your verified NFTs. You can list for sale, make offers, or view your assets on the Rarible marketplace. All actions are secure and on-chain.
          </>
        ) : (
          <>
            <span className="font-semibold text-gray-200">Marketplace:</span> Browse all TheAlien.888 NFTs available for purchase. Discover rare aliens, check activity, and trade directly with other collectors.
          </>
        )}
      </div>
      {/* Status banners */}
      {loading && (
        <div className="mb-4 flex items-center gap-2 text-base text-gray-400 justify-center">
          <span className="h-3 w-3 animate-ping rounded-full bg-emerald-400" />
          Loading NFTs from Rarible Protocol...
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl bg-red-900/20 p-4 text-base text-red-200 max-w-2xl mx-auto">
          {error}
        </div>
      )}
      {!loading && !error && nftsToShow.length === 0 && (
        <div className="mb-4 rounded-2xl bg-black/60 p-6 text-base text-emerald-100/80 max-w-2xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-300/80">
            No NFTs found in this view.
          </p>
        </div>
      )}
      {/* NFT Grid */}
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {nftsToShow.map((item: RaribleItem) => {
          const imageUrl = resolveItemImageUrl(item);
          // Only minted NFTs should be shown, but double-check here
          const isMinted = item.supply && Number(item.supply) > 0;
          if (!isMinted) return null;

          // Show actual collection name and verified status
          const THE_ALIEN_888_CONTRACT = "0x295a6a847e3715f224826aa88156f356ac523eef";
          const contractAddr = item.contract?.replace(/^ethereum:/i, '').toLowerCase();
          const isAlien888 = contractAddr === THE_ALIEN_888_CONTRACT;
          let collectionName = "Unknown";
          let showVerified = false;
          if (typeof item.collection === "object") {
            if ("name" in item.collection && item.collection.name) collectionName = item.collection.name;
            if ("verified" in item.collection && item.collection.verified) showVerified = true;
          }
          if (isAlien888) {
            collectionName = "TheAlien.888";
            showVerified = true;
          }
          const itemUrl = `/token/${item.contract.replace('ETHEREUM:', '')}/${item.tokenId}`;

          return (
            <Link href={itemUrl} key={item.id}>
               <article
                 className="group relative overflow-hidden rounded-2xl bg-gray-900/50"
              >
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-black/90">
                  <div className="relative aspect-square overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={String(imageUrl || "")}
                        alt={item.meta?.name ?? item.id}
                        width={256}
                        height={256}
                        className="h-full w-full transform object-cover transition duration-500 group-hover:scale-110 group-hover:brightness-110"
                        loading="lazy"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-emerald-950/40 text-xs text-emerald-200/60">
                        No preview
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-emerald-500/10 opacity-70 mix-blend-screen" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between space-y-3 p-3">
                    <div>
                      <h3 className="truncate text-base font-semibold text-emerald-100">
                        {item.meta?.name ?? `Token #${item.tokenId}`}
                      </h3>
                      {item.meta?.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-emerald-100">
                          {item.meta.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[12px] text-emerald-300/80">
                      <span className="flex items-center gap-1 rounded-full bg-gray-800 px-2 py-1 font-mono uppercase tracking-wide text-emerald-100">
                        {collectionName}
                        {showVerified && (
                          <svg
                            className="h-3 w-3 text-emerald-400 ml-1"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-label="Verified collection"
                            
                          >
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        )}
                      </span>
                      <span className="font-mono text-emerald-100">
                        #{item.tokenId}
                      </span>
                    </div>
                    {/* Action Buttons - Enhanced for My Collection */}
                     {isMyCollection ? (
                       <>
                         <div className="mt-2 space-y-2">
                           <div className="flex gap-2">
                             <button
                               onClick={(e) => {
                                 e.preventDefault();
                                 setSelectedItem(item);
                                 setAction("sell");
                               }}
                               className="flex-1 rounded-lg bg-gray-800 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-emerald-100 transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-black/60"
                             >
                               💰 List for Sale
                             </button>
                             <Link
                               href={`/token/${item.contract.replace('ETHEREUM:', '')}/${item.tokenId}`}
                               passHref
                               legacyBehavior
                             >
                               <a
                                 className="flex-1 rounded-lg bg-emerald-900 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-emerald-200 transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-black/60 no-underline"
                                 onClick={e => e.stopPropagation()}
                               >
                                 👁️ View
                               </a>
                             </Link>
                           </div>
                           <button
                             onClick={(e) => {
                               e.preventDefault();
                               setSelectedItem(item);
                               setAction("offer");
                             }}
                             className="block w-full rounded-lg bg-gray-800/50 px-3 py-1.5 text-center text-xs font-medium uppercase tracking-wide text-emerald-100 transition hover:bg-gray-700/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-black/60"
                           >
                             🤝 Make Offer
                           </button>
                         </div>
                         {/* Rarible Activity Feed & Listing Price */}
                         <RaribleActivity contract={item.contract.replace(/^ethereum:/i, "")} tokenId={item.tokenId} />
                       </>
                     ) : (
                      <div className="mt-2 flex items-center justify-between text-[12px]">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedItem(item);
                            setAction("bid");
                          }}
                          className="rounded-full bg-amber-900/40 px-2 py-1 font-mono uppercase tracking-wide text-amber-400 transition hover:bg-amber-800/40 focus:outline-none focus:ring-2 focus:ring-black/60"
                        >
                          Buy/Offer
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="pointer-events-none absolute inset-px rounded-2xl opacity-0 transition" />
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Gallery;
