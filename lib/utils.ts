
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Type Definitions for Rarible
export interface RaribleItem {
  id: string;
  blockchain: string;
  collection: string;
  contract: string;
  tokenId: string;
  creators: Array<{ account: string; value: number }>;
  owners: string[];
  royalties: Array<{ account: string; value: number }>;
  lazySupply: string;
  pending: Array<any>;
  mintedAt: string;
  lastUpdatedAt: string;
  supply: string;
  meta?: {
    name?: string;
    description?: string;
    image?: { url: string };
    content?: Array<{ url: string; representation?: string }>;
    attributes?: Array<{ key: string; value: string }>;
  };
  deleted: boolean;
  auctions: Array<any>;
  totalStock: string;
  sellers: number;
}

export function resolveItemImageUrl(item: RaribleItem): string | undefined {
  const meta = item.meta;
  if (!meta) return undefined;
  if (meta.image?.url) return meta.image.url;
  const preferred = meta.content?.find((c) => c.representation === 'PREVIEW') ?? meta.content?.[0];
  return preferred?.url;
}
