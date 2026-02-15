
[![Netlify Status](https://api.netlify.com/api/v1/badges/d2cedaab-0829-4e06-8e20-d6d3108689ef/deploy-status)](https://app.netlify.com/projects/thealien888-marketplace/deploys)
# TheAlien888 Marketplace

A standalone Next.js 16 + TypeScript NFT marketplace interface for the **TheAlien.888** collection on Ethereum, designed as a subproject within the main TheAlien888 Interface repository.

---

## 🌟 First-Gen AI-Powered NFT Project with Web3 Subdomains

**TheAlien.888** is the first generation NFT project powered by AI to adopt web3 subdomain technology since 2020. This pioneering approach enables every NFT holder to claim a unique, on-chain subdomain, blending digital identity, collectibles, and AI-driven experiences in a single platform.

---


## 📦 Project Overview

- **Purpose:** Marketplace for TheAlien.888 NFTs, with wallet integration, Rarible API data, and a cyberpunk UI.
- **Location:** This folder is a self-contained app inside the parent repo. It can be developed, built, and deployed independently.
- **Parent Repo:** For overall architecture, AI automation, and interface details, see the parent [README.md](../README.md).

---

## ⚙️ Features

- **AI-Powered NFT Experience:** TheAlien.888 leverages AI for generative art, metadata, and interactive features.
- **Web3 Subdomain Integration:** Each NFT holder can claim a personalized subdomain (e.g., `yourname.thealien.888`), making this the first NFT project to offer on-chain web3 subdomains since 2020.
- **Wallet Integration:** RainbowKit + Wagmi (Ethereum mainnet)
- **NFT Data:** Fetched from Rarible Protocol v0.1 API
- **UI:** Tailwind CSS v4, dark cyberpunk theme (emerald/fuchsia)
- **3D Gallery:** Three.js + React Three Fiber for immersive NFT display
- **API Proxy:** Secure server-side Rarible API key usage
- **Staking & Rewards:** Stake your NFTs in the Hibernation Chamber to earn rewards and unlock perks
- **Eligibility-Based Subdomain Claim:** Only verified NFT holders can mint a subdomain
- **Activity Feed:** View on-chain activity and trading history for each NFT

---

## 🚀 Getting Started


1. **Install dependencies:**

   ```bash
   cd thealien888-marketplace
   npm install
   ```

2. **Set up environment variables:**

   - Create a `.env.local` file in this folder with:

     ```env
     RARIBLE_API_KEY=your_rarible_api_key_here
     ```

   - Restart the dev server after adding or changing `.env.local`.

3. **Run the development server:**

   ```bash
   npm run dev
   ```

   - App runs at [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Structure & Key Files

- `app/` — Next.js app directory (API routes, pages, providers)
- `components/` — UI and feature components (Gallery, Staking, SubdomainClaim, etc.)
- `lib/` — Rarible API logic, types, and utilities
- `public/` — Static assets
- `README.md` — This file

---

## 📝 Usage Notes

- All scripts (dev, build, lint) should be run from this folder.
- This app is independent of the parent repo’s build or AI automation. No changes to the parent repo are required to use or develop this module.
- For monorepo integration, see the parent repo’s documentation.

---

## 📚 More Info

- For parent repo structure, AI automation, and interface details, see [../README.md](../README.md).
- For troubleshooting Rarible API, see [RARIBLE_API_DEBUG.md](RARIBLE_API_DEBUG.md) in this folder.

---

## 🤝 Contributing

- PRs and issues for the marketplace should be opened in the context of this subproject.
- Please follow the coding conventions and structure outlined above.

---

## License

See the parent repository for licensing information.
