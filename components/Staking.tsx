'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { erc721Abi, parseAbi } from 'viem';
import { Button } from '@/components/ui/button';
import { resolveItemImageUrl, RaribleItem } from '@/lib/utils';

const STAKING_CONTRACT_ADDRESS = '0xYOUR_STAKING_CONTRACT_ADDRESS'; // Demo placeholder
const NFT_CONTRACT_ADDRESS = '0x295a6a847e3715f224826aa88156f356ac523eef';

// Minimal Staking ABI for demo
const STAKING_ABI = parseAbi([
  'function stake(uint256 tokenId) external',
  'function withdraw(uint256 tokenId) external',
  'function getStakeInfo(address staker) external view returns (uint256[], uint256)'
]);

export function Staking() {
  const { address, isConnected } = useAccount(); // Use only standard wagmi hooks for wallet access
  const { writeContract, isPending } = useWriteContract();
  const [ownedNFTs, setOwnedNFTs] = useState<RaribleItem[]>([]);
  const [stakedNFTs, setStakedNFTs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Check if the staking contract is approved
  const { data: isApproved } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: erc721Abi,
    functionName: 'isApprovedForAll',
    args: address ? [address, STAKING_CONTRACT_ADDRESS] : undefined,
  });

  // Fetch user's NFTs
  useEffect(() => {
    if (!address) return;

    setLoading(true);
    fetch(`/api/rarible/alien888-owned?owner=${address}&size=50`)
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          setOwnedNFTs(data.items);
        }
      })
      .catch(err => console.error('Error fetching owned NFTs:', err))
      .finally(() => setLoading(false));
  }, [address]);

  const handleApprove = () => {
    if (!address) return;
    writeContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: erc721Abi,
      functionName: 'setApprovalForAll',
      args: [STAKING_CONTRACT_ADDRESS, true],
    });
  };

  const handleStake = (tokenId: string) => {
    if (!isApproved) {
      handleApprove();
      return;
    }

    writeContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: STAKING_ABI,
      functionName: 'stake',
      args: [BigInt(tokenId)],
    });
  };

  const handleWithdraw = (tokenId: string) => {
    writeContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: STAKING_ABI,
      functionName: 'withdraw',
      args: [BigInt(tokenId)],
    });
  };

  const unstakedNFTs = ownedNFTs.filter(nft => !stakedNFTs.includes(nft.tokenId));

  return (
    <div className="rounded-3xl border border-fuchsia-500/30 bg-black/60 p-1 shadow-[0_0_50px_rgba(147,51,234,0.2)]">
      <div className="rounded-[calc(1.5rem-1px)] bg-black/90 p-6">
        <div className="mb-6 flex items-center justify-between border-b border-fuchsia-500/20 pb-4">
          <h2 className="text-xl font-bold text-fuchsia-100 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-fuchsia-400" />
            Hibernation Chamber
          </h2>
          <p className="text-xs text-fuchsia-300/60 font-mono">Stake & Earn</p>
        </div>

        {/* Demo Notice */}
        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-sm text-yellow-300 font-semibold">
            🚧 Demo Mode: Staking contract deployment in progress
          </p>
          <p className="text-xs text-yellow-300/70 mt-1">
            This interface is ready for when the smart contract goes live
          </p>
        </div>

        {!isConnected ? (
          <div className="text-center py-12">
            <p className="text-fuchsia-300/60">Connect your wallet to view your NFTs</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-fuchsia-500 border-r-transparent"></div>
            <p className="text-fuchsia-300/60 mt-4">Loading your Aliens...</p>
          </div>
        ) : ownedNFTs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-fuchsia-300/60">You don't own any TheAlien.888 NFTs yet</p>
          </div>
        ) : (
          <>
            {/* Unstaked NFTs */}
            {unstakedNFTs.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-emerald-300 mb-4">
                  Available for Hibernation ({unstakedNFTs.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unstakedNFTs.map((nft) => (
                    <div
                      key={nft.id}
                      className="border border-emerald-500/30 rounded-lg bg-black/50 p-4 hover:border-emerald-500/60 transition-all"
                    >
                      {resolveItemImageUrl(nft) && (
                        <img
                          src={resolveItemImageUrl(nft)}
                          alt={nft.meta?.name || `Token #${nft.tokenId}`}
                          className="w-full aspect-square object-cover rounded-lg mb-3"
                        />
                      )}
                      <p className="text-sm font-semibold text-emerald-100 mb-2">
                        {nft.meta?.name || `Alien #${nft.tokenId}`}
                      </p>
                      <Button
                        onClick={() => handleStake(nft.tokenId)}
                        disabled={isPending}
                        className="w-full bg-gradient-to-r from-emerald-600 to-fuchsia-600 hover:from-emerald-500 hover:to-fuchsia-500 text-white font-semibold"
                      >
                        {!isApproved ? 'Approve & Hibernate' : isPending ? 'Processing...' : '🛌 Hibernate'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Staked NFTs */}
            {stakedNFTs.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-fuchsia-300 mb-4">
                  Currently Hibernating ({stakedNFTs.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ownedNFTs
                    .filter(nft => stakedNFTs.includes(nft.tokenId))
                    .map((nft) => (
                      <div
                        key={nft.id}
                        className="border border-fuchsia-500/30 rounded-lg bg-black/50 p-4 hover:border-fuchsia-500/60 transition-all relative"
                      >
                        <div className="absolute top-2 right-2 bg-fuchsia-500/20 border border-fuchsia-500/50 rounded-full px-3 py-1">
                          <span className="text-xs font-semibold text-fuchsia-300">Staked</span>
                        </div>
                        {resolveItemImageUrl(nft) && (
                          <img
                            src={resolveItemImageUrl(nft)}
                            alt={nft.meta?.name || `Token #${nft.tokenId}`}
                            className="w-full aspect-square object-cover rounded-lg mb-3 opacity-75"
                          />
                        )}
                        <p className="text-sm font-semibold text-fuchsia-100 mb-2">
                          {nft.meta?.name || `Alien #${nft.tokenId}`}
                        </p>
                        <Button
                          onClick={() => handleWithdraw(nft.tokenId)}
                          disabled={isPending}
                          className="w-full bg-gradient-to-r from-fuchsia-600 to-emerald-600 hover:from-fuchsia-500 hover:to-emerald-500 text-white font-semibold"
                        >
                          {isPending ? 'Processing...' : '⏰ Wake Up'}
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Staking Info */}
            <div className="mt-8 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-lg p-4">
              <h4 className="text-sm font-bold text-fuchsia-300 mb-2">Hibernation Benefits:</h4>
              <ul className="text-xs text-fuchsia-200/70 space-y-1">
                <li>• Earn passive rewards while your Aliens rest</li>
                <li>• Participate in exclusive holder events</li>
                <li>• Unlock special perks and utilities</li>
                <li>• Withdraw anytime - no lock period</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}