"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
// import AlienLairGallery from '../../components/AlienLairGallery';
import { RaribleItem, resolveItemImageUrl } from '@/lib/utils';

export default function LairPage() {
  const { address } = useAccount();
  const [nftImages, setNftImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNfts() {
      console.log('LairPage: address:', address);
      if (address) {
        try {
          setLoading(true);
          const response = await fetch(`/api/rarible/alien888-owned?owner=${address}`);
          if (!response.ok) {
            throw new Error('Failed to fetch NFTs');
          }
          const data: { items: RaribleItem[] } = await response.json();
          console.log('LairPage: raw data from API:', data);

          const imageUrls = data.items
            .map(item => resolveItemImageUrl(item))
            .filter((url): url is string => !!url);
          console.log('LairPage: extracted image URLs:', imageUrls);
          
          setNftImages(imageUrls);
        } catch (error) {
          console.error('LairPage: error fetching NFTs:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setNftImages([]);
        setLoading(false);
      }
    }

    fetchNfts();
  }, [address]);

  if (loading) {
    return (
      <main className="flex items-center justify-center h-screen bg-black text-green-400 font-mono">
        <div>Loading The Lair...</div>
      </main>
    );
  }

  if (!address) {
    return (
      <main className="flex items-center justify-center h-screen bg-black text-green-400 font-mono">
        <div>Please connect your wallet to see your Alien.888 NFTs.</div>
      </main>
    );
  }
  
  if (nftImages.length === 0) {
    return (
      <main className="flex items-center justify-center h-screen bg-black text-green-400 font-mono">
        <div>No Alien.888 NFTs found in your wallet.</div>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center h-screen bg-black text-emerald-300 font-mono">
      <div className="p-8 border border-emerald-500/30 rounded-xl bg-black/70 text-lg">
        The 3D Alien Lair gallery is temporarily disabled due to compatibility issues.<br />
        Please check back soon for the immersive experience!
      </div>
    </main>
  );
}