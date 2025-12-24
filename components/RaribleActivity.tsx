// RaribleActivity.tsx
// Shows recent activity, listing price, and sales for a given NFT (tokenId)
'use client';
import { useAccount } from 'wagmi'; 
import { fetchAlien888ItemsByOwner } from '../lib/RaribleService';
import React, { useEffect, useState } from 'react';

interface RaribleOrder {
  id: string;
  makePrice: string;
  takePrice: string;
  price: string;
  status: string;
  createdAt: string;
  type: string;
  maker: string;
  taker?: string;
  fill?: string;
  hash?: string;
}

interface RaribleActivityEvent {
  id: string;
  type: string;
  date: string;
  price?: string;
  maker?: string;
  taker?: string;
  transactionHash?: string;
}

export function RaribleActivity({ contract, tokenId }: { contract: string; tokenId: string }) {
  const [orders, setOrders] = useState<RaribleOrder[]>([]);
  const [activity, setActivity] = useState<RaribleActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch active orders (listings)
        const orderRes = await fetch(
          `https://api.rarible.org/v0.1/orders/sell/byItem?itemId=ETHEREUM:${contract}:${tokenId}&size=1`
        );
        const orderData = await orderRes.json();
        if (!cancelled) setOrders(orderData.orders || []);

        // Fetch recent activity (sales, offers, mint, etc.)
        const actRes = await fetch(
          `https://api.rarible.org/v0.1/activity/byItem?itemId=ETHEREUM:${contract}:${tokenId}&type=SELL,TRANSFER,MINT,BID,LIST,BUY,MAKE_OFFER&size=5`
        );
        const actData = await actRes.json();
        if (!cancelled) setActivity(actData.activities || []);
      } catch (e) {
        if (!cancelled) setError('Failed to load activity.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [contract, tokenId]);

  if (loading) return <div className="text-xs text-emerald-300">Loading activity...</div>;
  if (error) return <div className="text-xs text-red-400">{error}</div>;

  return (
    <div className="mt-2 rounded-lg bg-black/70 p-2 text-xs text-emerald-100/80 border border-emerald-500/10">
      {/* Listing Price */}
      {orders.length > 0 ? (
        <div className="mb-1 flex items-center gap-2">
          <span className="font-bold text-emerald-300">Listed:</span>
          <span className="font-mono text-emerald-200">
            {Number(orders[0].makePrice) / 1e18} ETH
          </span>
        </div>
      ) : (
        <div className="mb-1 text-emerald-300/60">Not currently listed</div>
      )}
      {/* Recent Activity */}
      <div className="mt-1">
        <div className="font-bold text-emerald-200 mb-1">Recent Activity:</div>
        {activity.length === 0 && <div className="text-emerald-300/60">No recent activity</div>}
        <ul className="space-y-1">
          {activity.map((ev) => (
            <li key={ev.id} className="flex items-center gap-2">
              <span className="rounded bg-emerald-900/40 px-2 py-0.5 font-mono text-emerald-300">
                {ev.type}
              </span>
              <span className="text-emerald-100/80">
                {ev.price ? `${Number(ev.price) / 1e18} ETH` : ''}
              </span>
              <span className="text-emerald-200/60">
                {new Date(ev.date).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
