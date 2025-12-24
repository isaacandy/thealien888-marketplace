import { createRaribleSdk } from '@rarible/sdk';
import { toItemId } from '@rarible/types';
import { Web3Ethereum } from '@rarible/web3-ethereum';
import Web3 from 'web3';
import { RaribleItem } from './utils';

import { EthereumWallet } from '@rarible/sdk-wallet';

const RARIBLE_API_BASE_URL = 'https://api.rarible.com/v0.1';
function getRaribleApiKey(): string {
  // This function safely accesses environment variables for both server and client.
  // On the server, it can access both RARIBLE_API_KEY and NEXT_PUBLIC_RARIBLE_API_KEY.
  if (typeof process !== 'undefined' && process.env) {
    return process.env.RARIBLE_API_KEY || process.env.NEXT_PUBLIC_RARIBLE_API_KEY || '';
  }
  // On the client, it can only access variables prefixed with NEXT_PUBLIC_.
  return process.env.NEXT_PUBLIC_RARIBLE_API_KEY || '';
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

export interface FetchCollectionOptions {
  size?: number;
  continuation?: string;
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


  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Referer': 'http://localhost:3000',
    'X-API-KEY': process.env.RARIBLE_API_KEY || process.env.NEXT_PUBLIC_RARIBLE_API_KEY || '',
  };

  const response = await fetch(
    `${RARIBLE_API_BASE_URL}/items/byCollection?${params.toString()}`,
    { headers },
  );

  if (!response.ok) {
    throw new Error(`Rarible API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return {
    items: data.items,
    continuation: data.continuation,
  };
}

// Fetch items owned by a specific address from the Alien888 collection
async function fetchItemsByOwner(
  ownerAddress: string,
  options: FetchOwnerItemsOptions = {},
): Promise<FetchCollectionItemsResult> {

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

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Referer': 'http://localhost:3000',
    'X-API-KEY': process.env.RARIBLE_API_KEY || process.env.NEXT_PUBLIC_RARIBLE_API_KEY || '',
  };


  const url = `${RARIBLE_API_BASE_URL}/items/byOwner?${params.toString()}`;
  const response = await fetch(url, { headers });

  if (!response.ok) {
    // Clean error handling for production
    try {
      await response.json();
    } catch {}
    throw new Error(`Rarible API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return { items: data.items, continuation: data.continuation };
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
// Use only official Rarible SDK as a library, not as a global or legacy script
export async function createSellOrder(itemId: string, price: number) {
  // Use window.ethereum as the provider for Web3 (must be run in browser)
  // @ts-expect-error: window.ethereum is only available in browser
  const web3Instance = new Web3(typeof window !== 'undefined' ? window.ethereum : undefined);
  const web3 = new Web3Ethereum({ web3: web3Instance });
  const ethWallet = new EthereumWallet(web3);
  const sdk = createRaribleSdk(ethWallet, 'prod', { apiKey: getRaribleApiKey() });
  return await sdk.order.sell({ itemId: toItemId(itemId), price, currency: { '@type': 'ETH' } });
}

export async function createBidOrder(itemId: string, price: number) {
  // Use window.ethereum as the provider for Web3 (must be run in browser)
  // @ts-expect-error: window.ethereum is only available in browser
  const web3Instance = new Web3(typeof window !== 'undefined' ? window.ethereum : undefined);
  const web3 = new Web3Ethereum({ web3: web3Instance });
  const ethWallet = new EthereumWallet(web3);
  const sdk = createRaribleSdk(ethWallet, 'prod', { apiKey: getRaribleApiKey() });
  return await sdk.order.bid({ itemId: toItemId(itemId), price, currency: { '@type': 'ETH' } });
}

export async function fetchItemById(itemId: string): Promise<RaribleItem> {
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };
  const apiKey = getRaribleApiKey();
  if (apiKey) {
    headers['X-API-KEY'] = apiKey;
  }

  const response = await fetch(
    `${RARIBLE_API_BASE_URL}/items/${itemId}`,
    { headers },
  );

  if (!response.ok) {
    throw new Error(`Rarible API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}