import { createRaribleSdk } from '@rarible/sdk';
import { toItemId } from '@rarible/types';
import { Web3Ethereum } from '@rarible/web3-ethereum';
import { RaribleItem } from './utils';

import { EthereumWallet } from '@rarible/sdk-wallet';
import { WalletClient } from 'viem';
import { publicActions } from 'viem';

const RARIBLE_API_BASE_URL = 'https://api.rarible.com/v0.1';
function getRaribleApiKey(): string {
  // Only allow RARIBLE_API_KEY to be used on the server (never in client bundle)
  if (typeof window === 'undefined' && typeof process !== 'undefined' && process.env) {
    return process.env.RARIBLE_API_KEY || '';
  }
  // On the client, only allow NEXT_PUBLIC_RARIBLE_API_KEY (if ever needed)
  return '';
}

/**
 * Creates the headers required for Rarible API requests.
 * @internal
 */
export function _createRaribleHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };

  // Try setting referer to localhost for server-side requests
  // This may be required by Rarible API key configuration
  if (typeof window === 'undefined') {
    // Server-side: set referer to localhost
    headers['Referer'] = 'http://localhost:3000';
  }

  const apiKey = getRaribleApiKey();
  if (apiKey) {
    headers['X-API-KEY'] = apiKey;
  }
  return headers;
}

export const THE_ALIEN_888_COLLECTION_ID = 'ETHEREUM:0x295a6a847e3715f224826aa88156f356ac523eef';


export interface FetchCollectionItemsResult {
  items: RaribleItem[];
  continuation?: string;
}

export interface FetchOwnerItemsOptions {
  size?: number;
  continuation?: string;
  collectionId?: string;
}


export interface RaribleCollectionStats {
  floorPrice?: number;
  totalVolume?: number;
  totalMinted?: number; // supply
  owners?: number;
  highestSale?: number;
}

export interface FetchCollectionOptions {
  size?: number;
  continuation?: string;
}

// Helper to fetch collection summary/stats
export async function fetchCollectionStats(collectionId: string): Promise<RaribleCollectionStats> {
  // 1. Get basic collection metadata (supply, owners)
  let stats: RaribleCollectionStats = {};
  try {
    const res = await fetch(`${RARIBLE_API_BASE_URL}/collections/${collectionId}`, { headers: _createRaribleHeaders() });
    if (res.ok) {
      const data = await res.json();
      stats.totalMinted = Number(data.statistics?.items) || 0;
      stats.owners = Number(data.statistics?.owners) || 0;
      stats.floorPrice = Number(data.statistics?.floorPrice?.price) || 0;
      stats.totalVolume = Number(data.statistics?.totalVolume?.price) || 0; // Lifetime volume
    }
  } catch (e) {
    console.error("Failed to fetch collection stats:", e);
  }

  // 2. Calculate highest sale from historical activity (expensive, so limit or optimize if possible)
  // For this demo, we check the top sales or recent activity
  try {
    // Rarible API doesn't have a direct "highest sale ever" endpoint for free tier easily, 
    // but we can look for high value transfers/sales. 
    // For now, we will use a placeholder or derived value if API limits.
    // A better approach for "Highest Sale" is typically to index events, but we can try to get activity.
    const highest = await fetchHighestSale(collectionId);
    stats.highestSale = highest;
  } catch (e) {
    console.error("Failed to fetch highest sale:", e);
  }

  return stats;
}

async function fetchHighestSale(collectionId: string): Promise<number> {
  // Strategy: Fetch 'SELL' activity sorted by price DESC if possible, or fetch recent sales and find max.
  // Rarible activity API doesn't support sorting by price directly on general activity endpoint.
  // We will attempt to fetch a batch of recent 'SELL' activities and find the max.
  // NOTE: True lifetime highest sale requires full indexing. We will approximate with recent high value.
  try {
    const res = await fetch(
      `${RARIBLE_API_BASE_URL}/activity/byCollection?collection=${collectionId}&type=SELL&size=50`,
      { headers: _createRaribleHeaders() }
    );
    if (!res.ok) return 0;
    const data = await res.json();
    let maxPrice = 0;
    for (const act of (data.activities || [])) {
      const price = Number(act.price);
      if (!isNaN(price) && price > maxPrice) {
        maxPrice = price;
      }
    }
    return maxPrice;
  } catch {
    return 0;
  }
}


// Fetch all items from the Alien888 collection
export async function fetchAlien888Items(
  options: FetchCollectionOptions = {},
): Promise<FetchCollectionItemsResult> {

  const { size = 50, continuation } = options;

  const params = new URLSearchParams({
    collection: THE_ALIEN_888_COLLECTION_ID,
    size: size.toString(),
  });

  if (continuation) {
    params.append('continuation', continuation);
  }

  const response = await fetch(
    `${RARIBLE_API_BASE_URL}/items/byCollection?${params.toString()}`,
    { headers: _createRaribleHeaders() },
  );

  if (!response.ok) {
    let errorBody = `Rarible API error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorBody = `Rarible API error: ${errorData.message || JSON.stringify(errorData)}`;
    } catch (e) {
      // Ignore if parsing JSON fails
    }
    throw new Error(errorBody);
  }

  const data = await response.json();
  // Filter to only minted NFTs from the correct collection
  const filteredItems = (data.items || []).filter(
    (item: any) => {
      // Accept both string and object for collection/contract
      const contract = (typeof item.contract === 'string') ? item.contract.replace(/^ethereum:/i, '').toLowerCase() : '';
      const isCorrectCollection = contract === THE_ALIEN_888_COLLECTION_ID.replace(/^ETHEREUM:/i, '').toLowerCase();
      // Only minted NFTs (supply > 0)
      const isMinted = item.supply && Number(item.supply) > 0;
      return isCorrectCollection && isMinted;
    }
  );
  return {
    items: filteredItems,
    continuation: data.continuation,
  };
}

// Fetch items owned by a specific address from the Alien888 collection
async function fetchItemsByOwner(
  ownerAddress: string,
  options: FetchOwnerItemsOptions = {},
): Promise<FetchCollectionItemsResult> {
  if (!ownerAddress) {
    // Prevent API calls with an invalid owner address
    console.warn('fetchItemsByOwner called without an ownerAddress.');
    return { items: [], continuation: undefined };
  }

  const { size = 50, continuation, collectionId } = options;



  // Always use uppercase blockchain for Rarible: ETHEREUM:0x...
  let unionOwner = ownerAddress;
  if (typeof unionOwner === 'string') {
    const addr = unionOwner.replace(/^ethereum:/i, '').replace(/^ETHEREUM:/i, '').toLowerCase();
    unionOwner = `ETHEREUM:${addr}`;
  }

  const params = new URLSearchParams({
    owner: unionOwner,
    size: size.toString(),
  });


  // Remove debug logs for production cleanliness

  if (continuation) {
    params.append('continuation', continuation);
  }

  if (collectionId) {
    // Rarible expects contract address only for /items/byOwner
    const contractOnly = collectionId.replace(/^ETHEREUM:/i, '').toLowerCase();
    params.append('collection', contractOnly);
  }

  const url = `${RARIBLE_API_BASE_URL}/items/byOwner?${params.toString()}`;
  const response = await fetch(url, { headers: _createRaribleHeaders() });

  if (!response.ok) {
    let errorBody = `Rarible API error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorBody = `Rarible API error: ${errorData.message || JSON.stringify(errorData)}`;
    } catch { }
    throw new Error(errorBody);
  }

  const data = await response.json();
  // Filter to only minted NFTs from the correct collection
  const filteredItems = (data.items || []).filter(
    (item: any) => {
      const contract = (typeof item.contract === 'string') ? item.contract.replace(/^ethereum:/i, '').toLowerCase() : '';
      const isCorrectCollection = collectionId
        ? contract === collectionId.replace(/^ETHEREUM:/i, '').toLowerCase()
        : contract === THE_ALIEN_888_COLLECTION_ID.replace(/^ETHEREUM:/i, '').toLowerCase();
      const isMinted = item.supply && Number(item.supply) > 0;
      return isCorrectCollection && isMinted;
    }
  );
  return { items: filteredItems, continuation: data.continuation };
}

export async function fetchAlien888ItemsByOwner(
  ownerAddress: string,
  options: Omit<FetchOwnerItemsOptions, 'collectionId'> = {},
): Promise<FetchCollectionItemsResult> {
  const data = await fetchItemsByOwner(ownerAddress, {
    ...options,
    collectionId: THE_ALIEN_888_COLLECTION_ID,
  });
  return { items: data.items, continuation: data.continuation };
}

// SDK Trading Functions powered by Rarible

/**
 * Initializes the Rarible SDK with a viem WalletClient.
 * @internal
 */
function _initializeRaribleSdk(walletClient: WalletClient) {
  // Patch: Use a real Web3 instance for Rarible SDK compatibility
  // @ts-ignore
  const Web3 = require('web3');
  // @ts-ignore
  const provider = walletClient.transport?.provider || walletClient.provider;
  const web3V1 = new Web3(provider);
  if (!walletClient.account) {
    throw new Error('WalletClient.account is undefined. Please ensure the wallet is connected.');
  }
  const web3 = new Web3Ethereum({
    web3: web3V1,
    from: walletClient.account.address,
  });
  const ethWallet = new EthereumWallet(web3);
  // Patch: set blockchain property for Rarible SDK type compatibility
  (ethWallet as any).blockchain = "ETHEREUM";
  return createRaribleSdk(ethWallet as any, 'prod', { apiClientParams: { apiKey: getRaribleApiKey() } });
}

// Use only official Rarible SDK as a library, not as a global or legacy script
export async function createSellOrder(walletClient: WalletClient, itemId: string, price: number) {
  const sdk = _initializeRaribleSdk(walletClient);
  const action = await sdk.order.sell({ itemId: toItemId(itemId) });
  return await action.submit({ amount: 1, price, currency: { '@type': 'ETH' } });
}

export async function createBidOrder(walletClient: WalletClient, itemId: string, price: number) {
  const sdk = _initializeRaribleSdk(walletClient);
  const action = await sdk.order.bid({ itemId: toItemId(itemId) });
  return await action.submit({ amount: 1, price, currency: { '@type': 'ETH' } });
}

export async function fetchItemById(itemId: string): Promise<RaribleItem> {
  if (!itemId) {
    throw new Error('fetchItemById called without an itemId.');
  }

  const response = await fetch(
    `${RARIBLE_API_BASE_URL}/items/${itemId}`,
    { headers: _createRaribleHeaders() },
  );

  if (!response.ok) {
    let errorBody = `Rarible API error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorBody = `Rarible API error: ${errorData.message || JSON.stringify(errorData)
        }`;
    } catch (e) {
      // Ignore if parsing JSON fails
    }
    throw new Error(errorBody);
  }


  return await response.json();
}

export interface TokenPriceHistory {
  lastSalePrice?: number;
  lastSaleDate?: string; // ISO date string
  mintDate?: string;
}

export async function fetchTokenPriceHistory(contract: string, tokenId: string): Promise<TokenPriceHistory> {
  const history: TokenPriceHistory = {};
  const itemId = `ETHEREUM:${contract}:${tokenId}`;

  try {
    // 1. Fetch Mint Activity
    const mintRes = await fetch(
      `${RARIBLE_API_BASE_URL}/activity/byItem?itemId=${itemId}&type=MINT&size=1`,
      { headers: _createRaribleHeaders() }
    );
    if (mintRes.ok) {
      const mintData = await mintRes.json();
      if (mintData.activities && mintData.activities.length > 0) {
        history.mintDate = mintData.activities[0].date;
      }
    }

    // 2. Fetch Last Sale Activity
    const saleRes = await fetch(
      `${RARIBLE_API_BASE_URL}/activity/byItem?itemId=${itemId}&type=SELL&size=1`,
      { headers: _createRaribleHeaders() }
    );
    if (saleRes.ok) {
      const saleData = await saleRes.json();
      if (saleData.activities && saleData.activities.length > 0) {
        history.lastSalePrice = Number(saleData.activities[0].price);
        history.lastSaleDate = saleData.activities[0].date;
      }
    }
  } catch (e) {
    console.error("Error fetching token history:", e);
  }

  return history;
}

// Simple fallback cache for ETH price to avoid API spam
let cachedEthPrice = 0;
let lastEthFetch = 0;

export async function fetchEthPrice(): Promise<number> {
  const now = Date.now();
  // Cache for 5 minutes
  if (cachedEthPrice > 0 && (now - lastEthFetch < 300000)) {
    return cachedEthPrice;
  }

  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    if (res.ok) {
      const data = await res.json();
      const price = data.ethereum?.usd;
      if (price) {
        cachedEthPrice = price;
        lastEthFetch = now;
        return price;
      }
    }
  } catch (e) {
    console.error("Error fetching ETH price:", e);
  }
  return cachedEthPrice || 0; // Return 0 if failed
}
