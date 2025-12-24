

'use client';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, polygon } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';

const projectId = 'b3fef6dab890856558be338a1e2f9780'; // Replace with your actual Reown project ID

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [mainnet, polygon],
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, polygon],
  projectId,
  features: {
    socials: ['google', 'x', 'discord', 'apple', 'github'],
    email: true,
    onramp: true,
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}