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

interface CollectionStats {
  total_supply: number;
  num_owners: number;
  floor_price: number;
  total_volume: number;
  one_day_change: number;
}

import React, { useState, useEffect } from "react";

type ViewMode = "my-collection" | "all-collection";
type ActionType = "sell" | "bid" | "offer";
type ModalTab = "general" | "traits" | "bids" | "activity";
const GALLERY_API = "/api/rarible/alien888-owned";
const ALL_COLLECTION_API = "/api/rarible/alien888-collection";
const COLLECTION_STATS_API = "/api/opensea/collection-stats";

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

  // Modal overlay state for NFT details
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>("general");
  const handleViewDetails = (item: RaribleItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
    setActiveTab("general");
  };
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedItem(null);
    setActiveTab("general");
  };

  const [viewMode, setViewMode] = useState<ViewMode>("all-collection");
  const [items, setItems] = useState<RaribleItem[]>([]);
  const [allItems, setAllItems] = useState<RaribleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<RaribleItem | null>(null);
  const [action, setAction] = useState<ActionType | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [collectionStats, setCollectionStats] = useState<CollectionStats | null>(null);

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

  // Fetch overall collection stats (e.g., from OpenSea)
  useEffect(() => {
    const controller = new AbortController();
    setStatsLoading(true);
    async function loadStats() {
      try {
        console.log('Gallery: fetching collection stats');
        const res = await fetch(COLLECTION_STATS_API, { signal: controller.signal });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch collection stats');
        }
        const data: CollectionStats = await res.json();
        setCollectionStats(data);
      } catch (err: unknown) {
        console.error('Gallery: error fetching collection stats:', err);
      } finally {
        setStatsLoading(false);
      }
    }
    loadStats();
    return () => controller.abort();
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
      {/* NFT Detail Modal Overlay with Tabs */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold z-10"
              onClick={handleCloseDetailModal}
              aria-label="Close"
            >
              ×
            </button>
            <div className="flex flex-col">
              {/* Image and Title */}
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-shrink-0">
                  {resolveItemImageUrl(selectedItem) ? (
                    <Image
                      src={String(resolveItemImageUrl(selectedItem) || "")}
                      alt={selectedItem.meta?.name ?? selectedItem.id}
                      width={280}
                      height={280}
                      className="rounded-xl object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-70 h-70 flex items-center justify-center bg-emerald-950/40 text-xs text-emerald-200/60 rounded-xl">
                      No preview
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-emerald-100 mb-2">
                    {selectedItem.meta?.name ?? `Token #${selectedItem.tokenId}`}
                  </h2>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-mono text-emerald-300 text-xs">#{selectedItem.tokenId}</span>
                    {(() => {
                      const contractAddr = selectedItem.contract?.replace(/^ethereum:/i, '').toLowerCase();
                      if (contractAddr === "0x295a6a847e3715f224826aa88156f356ac523eef") {
                        return (
                          <span className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded-full text-emerald-100 text-xs font-mono">
                            TheAlien.888
                            <svg className="h-3 w-3 text-emerald-400 ml-1" viewBox="0 0 24 24" fill="currentColor" aria-label="Verified collection"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <a
                      href={`https://rarible.com/token/${selectedItem.contract.replace(/^ETHEREUM:/i, '')}:${selectedItem.tokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full rounded-lg bg-fuchsia-700/80 px-4 py-2 text-center text-sm font-semibold text-white shadow-[0_0_15px_rgba(232,121,249,0.5)] hover:bg-fuchsia-600 transition"
                    >
                      View on Rarible (Verified)
                    </a>
                    <button
                      onClick={() => {
                        setAction('bid');
                        setShowDetailModal(false);
                      }}
                      className="w-full rounded-lg bg-emerald-700/80 px-4 py-2 text-center text-sm font-semibold text-white shadow-[0_0_15px_rgba(52,211,153,0.5)] hover:bg-emerald-600 transition"
                    >
                      Buy / Make Offer
                    </button>
                    <button
                      onClick={() => {
                        setAction('sell');
                        setShowDetailModal(false);
                      }}
                      className="w-full rounded-lg bg-gray-800 px-4 py-2 text-center text-sm font-semibold text-emerald-100 hover:bg-gray-700 transition"
                      disabled={!isMyCollection}
                      title={isMyCollection ? '' : 'Only your NFTs can be listed for sale'}
                    >
                      List for Sale
                    </button>
                    <a
                      href={`/token/${selectedItem.contract.replace(/^ETHEREUM:/i, '')}/${selectedItem.tokenId}`}
                      className="w-full rounded-lg bg-gray-900 px-4 py-2 text-center text-xs font-semibold text-emerald-200 hover:bg-gray-800 transition"
                      onClick={handleCloseDetailModal}
                    >
                      Full Details Page
                    </a>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-700 mb-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("general")}
                    className={`px-4 py-2 text-sm font-semibold transition ${activeTab === "general"
                      ? "text-emerald-400 border-b-2 border-emerald-400"
                      : "text-gray-400 hover:text-emerald-300"
                      }`}
                  >
                    General
                  </button>
                  <button
                    onClick={() => setActiveTab("traits")}
                    className={`px-4 py-2 text-sm font-semibold transition ${activeTab === "traits"
                      ? "text-emerald-400 border-b-2 border-emerald-400"
                      : "text-gray-400 hover:text-emerald-300"
                      }`}
                  >
                    Traits/Properties
                  </button>
                  <button
                    onClick={() => setActiveTab("bids")}
                    className={`px-4 py-2 text-sm font-semibold transition ${activeTab === "bids"
                      ? "text-emerald-400 border-b-2 border-emerald-400"
                      : "text-gray-400 hover:text-emerald-300"
                      }`}
                  >
                    Bids
                  </button>
                  <button
                    onClick={() => setActiveTab("activity")}
                    className={`px-4 py-2 text-sm font-semibold transition ${activeTab === "activity"
                      ? "text-emerald-400 border-b-2 border-emerald-400"
                      : "text-gray-400 hover:text-emerald-300"
                      }`}
                  >
                    Activity
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-[200px]">
                {activeTab === "general" && (
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold text-emerald-400 mb-2">Description</h3>
                      <p className="text-emerald-200 text-sm whitespace-pre-line">
                        {selectedItem.meta?.description || "No description available."}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-emerald-400 mb-2">Details</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-400">Contract:</span> <span className="font-mono text-emerald-300">{selectedItem.contract}</span></p>
                        <p><span className="text-gray-400">Token ID:</span> <span className="font-mono text-emerald-300">{selectedItem.tokenId}</span></p>
                        <p><span className="text-gray-400">Blockchain:</span> <span className="font-mono text-emerald-300">{selectedItem.blockchain}</span></p>
                        <p><span className="text-gray-400">Supply:</span> <span className="font-mono text-emerald-300">{selectedItem.supply}</span></p>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "traits" && (
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-400 mb-3">Properties</h3>
                    {selectedItem.meta?.content && Array.isArray(selectedItem.meta.content) ? (
                      <div className="grid grid-cols-2 gap-3">
                        {selectedItem.meta.content.map((attr: any, idx: number) => (
                          <div key={idx} className="bg-gray-800/50 rounded-lg p-3">
                            <p className="text-xs text-gray-400 uppercase">{attr.representation || 'Property'}</p>
                            <p className="text-sm font-semibold text-emerald-100 mt-1">{attr.url || 'N/A'}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No properties available for this NFT.</p>
                    )}
                  </div>
                )}
                {activeTab === "bids" && (
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-400 mb-3">Current Listings & Bids</h3>
                    <p className="text-sm text-gray-400">Listing and bid information coming soon. For now, please check Rarible for live market data.</p>
                  </div>
                )}
                {activeTab === "activity" && (
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-400 mb-3">Activity History</h3>
                    <RaribleActivity contract={selectedItem.contract.replace(/^ETHEREUM:/i, "")} tokenId={selectedItem.tokenId} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Trade Modal for Sell/Bid/Offer */}
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
        <div className="mt-4 text-gray-400 text-sm flex flex-wrap items-center justify-center gap-2 px-4">
          <span className="font-mono whitespace-nowrap">Collection ID:</span>
          <a
            href="https://etherscan.io/address/0x295a6a847e3715f224826aa88156f356ac523eef"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-gray-300 hover:text-emerald-400 break-all max-w-full text-xs sm:text-sm transition-colors duration-200 cursor-pointer underline decoration-gray-500 hover:decoration-emerald-400"
            title="View contract on Etherscan"
          >
            ETHEREUM:0x295a6a847e3715f224826aa88156f356ac523eef
          </a>
        </div>
        {/* Collection Stats Display with Loading Skeleton */}
        {statsLoading ? (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto text-center animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-900/50 p-3 rounded-lg">
                <div className="h-7 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : collectionStats && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto text-center">
            <div className="bg-gray-900/50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-emerald-300">{collectionStats.total_supply}</div>
              <div className="text-xs text-gray-400 uppercase">Total Minted</div>
            </div>
            <div className="bg-gray-900/50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-emerald-300">{collectionStats.num_owners}</div>
              <div className="text-xs text-gray-400 uppercase">Owners</div>
            </div>
            <div className="bg-gray-900/50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-emerald-300">{collectionStats.floor_price || 'N/A'} <span className="text-base">ETH</span></div>
              <div className="text-xs text-gray-400 uppercase">Floor Price</div>
            </div>
            <div className="bg-gray-900/50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-emerald-300">{collectionStats.total_volume.toFixed(2)} <span className="text-base">ETH</span></div>
              <div className="text-xs text-gray-400 uppercase">Total Volume</div>
            </div>
          </div>
        )}
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
          if (typeof item.collection === "object" && item.collection !== null) {
            const collection = item.collection as { name?: string; verified?: boolean };
            if (collection.name) collectionName = collection.name;
            if (collection.verified) showVerified = collection.verified;
          }
          if (isAlien888) {
            collectionName = "TheAlien.888";
            showVerified = true;
          }
          // Instead of Link, use a clickable card to open modal
          return (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-2xl bg-gray-900/50 cursor-pointer"
              onClick={() => handleViewDetails(item)}
              tabIndex={0}
              aria-label={`View details for ${item.meta?.name ?? `Token #${item.tokenId}`}`}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleViewDetails(item); }}
              role="button"
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
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedItem(item);
                              setAction("sell");
                            }}
                            className="flex-1 rounded-lg bg-gray-800 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-emerald-100 transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-black/60"
                          >
                            💰 List for Sale
                          </button>
                          <a
                            href={`/token/${item.contract.replace(/^ETHEREUM:/i, '')}/${item.tokenId}`}
                            className="flex-1 rounded-lg bg-emerald-900 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-emerald-200 transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-black/60 no-underline"
                            onClick={e => e.stopPropagation()}
                          >
                            👁️ View
                          </a>
                        </div>
                        <button
                          onClick={e => {
                            e.stopPropagation();
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
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleViewDetails(item);
                        }}
                        className="flex-1 rounded-lg bg-emerald-900 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-emerald-200 transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-black/60"
                      >
                        👁️ View Details
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedItem(item);
                          setAction("bid");
                        }}
                        className="flex-1 rounded-lg bg-amber-900/40 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-amber-400 transition hover:bg-amber-800/40 focus:outline-none focus:ring-2 focus:ring-black/60"
                      >
                        Buy/Offer
                      </button>
                    </div>
                  )}
                </div>
                <div className="pointer-events-none absolute inset-px rounded-2xl opacity-0 transition" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Gallery;
