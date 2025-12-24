'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { erc721Abi } from 'viem';

const MINTING_MANAGER_ADDRESS = '0xc37d3c4326ab0e1d2b9d8b916bbdf5715f780fcf';
const NFT_CONTRACT_ADDRESS = '0x295a6a847e3715f224826aa88156f356ac523eef';

export function SubdomainClaim() {
  const [subdomain, setSubdomain] = useState('');
  const [totalMinted, setTotalMinted] = useState(0);
    const { address, isConnected } = useAccount(); // Use only standard wagmi hooks for wallet access
  const { writeContract, isPending } = useWriteContract();

  // Track loading state for eligibility
  const [eligibilityLoading, setEligibilityLoading] = useState(true);

  // Check user's NFT balance for eligibility
  const { data: nftBalance, isLoading: nftLoading } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: erc721Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Fetch total NFT supply to show subdomain availability
  const { data: totalSupply, isLoading: supplyLoading } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: erc721Abi,
    functionName: 'totalSupply',
  });

  const userNFTCount = nftBalance ? Number(nftBalance) : 0;
  const totalNFTSupply = totalSupply ? Number(totalSupply) : 0;
  const isEligible = userNFTCount > 0;

  // Set eligibilityLoading false after client loads wallet and NFT data
  useEffect(() => {
    if (!isConnected) {
      setEligibilityLoading(false);
      return;
    }
    if (!nftLoading) {
      setEligibilityLoading(false);
    }
  }, [isConnected, nftLoading]);

  const handleMint = () => {
    if (!isEligible || !address) return;

    writeContract({
      address: MINTING_MANAGER_ADDRESS,
      abi: [{
        "inputs": [
          { "internalType": "address", "name": "to", "type": "address" },
          { "internalType": "string[]", "name": "labels", "type": "string[]" },
          { "internalType": "string[]", "name": "keys", "type": "string[]" },
          { "internalType": "string[]", "name": "values", "type": "string[]" }
        ],
        "name": "issueWithRecords",
        "stateMutability": "nonpayable",
        "type": "function"
      }],
      functionName: 'issueWithRecords',
      args: [address, [subdomain, 'thealien', '888'], [], []],
    });
  };

  return (
    <div className="rounded-3xl border border-emerald-500/30 bg-black/60 p-1 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
      <div className="rounded-[calc(1.5rem-1px)] bg-black/90 p-6">
        <div className="mb-6 flex items-center justify-between border-b border-emerald-500/20 pb-4">
          <h2 className="text-xl font-bold text-emerald-100 flex items-center gap-2">
           
            Claim Your Web3 Identity
          </h2>
          <span className="flex items-center gap-2">
            <p className="text-xs text-emerald-300/60 font-mono">Polygon Network</p>
            <span className="h-2 w-2 animate-pulse rounded-full bg-fuchsia-400" />
          </span>
        </div>

        {/* Domain Display */}
        <div className="mb-6 text-center">
          <p className="text-sm text-emerald-300/70 mb-2">Your subdomain will be:</p>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
            <p className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-fuchsia-400 bg-clip-text text-transparent">
              {subdomain || 'yourname'}.thealien.888
            </p>
          </div>
        </div>

        {/* Eligibility Status - prevent hydration mismatch by showing loading/neutral state until client loads */}
        {eligibilityLoading ? (
          <div className="mb-4 p-4 rounded-lg border bg-emerald-500/5 border-emerald-500/10 animate-pulse">
            <p className="text-sm font-semibold text-emerald-200/70">Checking eligibility...</p>
          </div>
        ) : isConnected ? (
          <div className={`mb-4 p-4 rounded-lg border ${isEligible
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-red-500/10 border-red-500/30'
            }`}>
            <p className={`text-sm font-semibold ${isEligible ? 'text-emerald-300' : 'text-red-300'
              }`}>
              {isEligible
                ? `✓ Eligible! You own ${userNFTCount} TheAlien.888 NFT${userNFTCount > 1 ? 's' : ''}`
                : '✗ Not Eligible: You must own at least 1 TheAlien.888 NFT to claim a subdomain'
              }
            </p>
          </div>
        ) : (
          <div className="mb-4 p-4 rounded-lg border bg-yellow-500/10 border-yellow-500/30">
            <p className="text-sm font-semibold text-yellow-300">
              ⚠ Please connect your wallet to check eligibility
            </p>
          </div>
        )}

        {/* Input and Mint Button */}
        <div className="flex gap-2 mb-4">
          <Input
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="yourname"
            className="bg-black/50 border-emerald-500/30 text-emerald-100 placeholder:text-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-black/60"
            disabled={!isConnected || !isEligible}
          />
          <Button
            onClick={handleMint}
            disabled={isPending || !subdomain || !isEligible || !isConnected}
            className="bg-gradient-to-r from-emerald-600 to-fuchsia-600 hover:from-emerald-500 hover:to-fuchsia-500 text-white font-semibold px-6 focus:outline-none focus:ring-2 focus:ring-black/60"
          >
            {isPending ? 'Confirming...' : 'Mint Subdomain'}
          </Button>
        </div>

        {/* Gas Fee Note */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg mb-4 text-sm text-emerald-200">
          <p className="font-bold mb-1">⛽ Gas Note:</p>
          <p>Minting requires a small network fee in <strong>MATIC</strong> on Polygon (~$0.01 - $0.10).</p>
        </div>

        {/* Subdomain Availability Counter */}
        <div className="bg-fuchsia-500/10 border border-fuchsia-500/20 p-4 rounded-lg text-center">
          <p className="text-xs text-fuchsia-300/70 mb-1">Subdomain Availability</p>
          <p className="text-lg font-bold text-fuchsia-200">
            <span className="text-2xl text-fuchsia-400">{totalMinted}</span> minted / <span className="text-2xl text-emerald-400">{totalNFTSupply}</span> total available
          </p>
          <p className="text-xs text-fuchsia-300/60 mt-1">
            Based on total TheAlien.888 NFTs minted
          </p>
        </div>
      </div>
    </div>
  );
}