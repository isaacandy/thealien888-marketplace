'use client';

import Gallery from '@/components/Gallery';
import { SubdomainClaim } from '@/components/SubdomainClaim';
import { Staking } from '@/components/Staking';
import StarfieldBackground from '@/components/StarfieldBackground';
import { Dashboard } from '@/components/Dashboard';

export default function Home() {
  return (
    <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-10">
      {/* Dynamic Starfield Background to match Parent Site theme */}
      <StarfieldBackground />

      <header className="relative z-10 flex flex-col items-start justify-between gap-6 pb-8 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-emerald-400/80">
            Ethereum Mainnet • 0x295a...3eef
          </p>
          <h1 className="mt-3 bg-gradient-to-r from-emerald-300 via-emerald-500 to-fuchsia-500 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
            TheAlien.888 Hub
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-emerald-100/70">
            Manage your Aliens, claim your Web3 identity, and enter the hibernation chamber.
            All powered by the Rarible Protocol and Reown.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Reown AppKit Button supporting Social Logins */}
          <appkit-button />
          <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/60">
            Secure Web3 Access
          </div>
        </div>
      </header>

      {/* 1. Dashboard: Collection Stats & Minting Actions */}
      <section id="dashboard" className="relative z-10 mt-6 mb-8">
        <Dashboard />
      </section>

      {/* 2. NFT Gallery Section */}
      <section id="marketplace" className="relative z-10 mt-4">
        <div className="bg-black/90 p-6 rounded-2xl border border-emerald-500/20">
          <div className="mb-6 flex items-center justify-between pb-4 border-b border-emerald-500/20">
            <h2 className="text-xl font-bold text-emerald-100 flex items-center gap-2">
              TheAlien.888 Collection
            </h2>
            <div className="flex items-center text-xs text-emerald-300/60 font-mono">
              Status: Live Gallery
              <span className="ml-2 h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            </div>
          </div>
          <Gallery />
        </div>
      </section>

      {/* 3. Web3 Subdomain Claim Section */}
      <section id="identity" className="relative z-10 mt-12">
        <SubdomainClaim />
      </section>

      {/* 4. Hibernation & Staking Section */}
      <section id="staking" className="relative z-10 mt-12 mb-20">
        <Staking />
      </section>

      <footer className="relative z-10 mt-auto border-t border-emerald-500/20 py-8 text-center">
        <p className="text-xs font-mono text-emerald-500/40 uppercase tracking-widest">
          © 2025 TheAlien.888 • Pioneering AI-Powered Identity
        </p>
      </footer>
    </main>
  );
}