import { createRaribleSdk } from '@rarible/sdk';
import { toItemId } from '@rarible/types';
import { Web3Ethereum } from '@rarible/web3-ethereum';
import { RaribleItem } from './utils';

import { EthereumWallet } from '@rarible/sdk-wallet';
import { WalletClient } from 'viem';
import { publicActions } from 'viem';

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
    } catch {}
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
      errorBody = `Rarible API error: ${
        errorData.message || JSON.stringify(errorData)
      }`;
    } catch (e) {
      // Ignore if parsing JSON fails
    }
    throw new Error(errorBody);
  }

  return await response.json();
}