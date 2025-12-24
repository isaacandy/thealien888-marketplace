
# Copilot Instructions – TheAlien.888 Marketplace

## Project Overview
This is a Next.js 16 + TypeScript NFT marketplace for the **TheAlien.888** collection on Ethereum. It integrates RainbowKit/Wagmi for wallet connection, fetches NFT data from the Rarible Protocol v0.1 API, and uses Tailwind CSS for a dark, neon cyberpunk UI (emerald/fuchsia on black).

**Collection ID:** `ETHEREUM:0x295a6a847e3715f224826aa88156f356ac523eef`

## Architecture & Data Flow
- **Wallet Connection:** Managed in [app/providers.tsx](../app/providers.tsx) using Wagmi/RainbowKit (Ethereum mainnet only).
- **Client Components:** All user-facing components (e.g., [components/Gallery.tsx](../components/Gallery.tsx), [components/Staking.tsx](../components/Staking.tsx), [components/SubdomainClaim.tsx](../components/SubdomainClaim.tsx)) use `'use client'` and read the wallet via `useAccount()`.
- **API Proxy:** [app/api/rarible/alien888-owned/route.ts](../app/api/rarible/alien888-owned/route.ts) validates params, rate-limits `size`, and proxies requests to Rarible with a server-side API key.
- **Core API Logic:** [lib/RaribleService.ts](../lib/RaribleService.ts) defines types, fetches, and SDK trading functions. All Rarible API calls and type definitions are centralized here.

## Key Patterns & Conventions
- **Component Data Fetching:** Always fetch NFT data via `/api/rarible/alien888-owned?owner=0x...&size=50` (or similar). Never call Rarible directly from the client.
- **Error Handling:** API routes return 400 for missing/invalid params, 502 for Rarible errors. Client components use `error` state and a `cancelled` flag in `useEffect` cleanup to avoid state updates after unmount.
- **TypeScript:** Use strict interfaces from [lib/RaribleService.ts](../lib/RaribleService.ts). Avoid `any`; use generics for fetch helpers.
- **Styling:** Use Tailwind v4 classes. Emerald (`emerald-500`) and fuchsia (`fuchsia-500`) are primary colors. Neon glow via `shadow-[0_0_15px_rgba(52,211,153,0.8)]` etc. See [app/globals.css](../app/globals.css).
- **3D Gallery:** [components/AlienLairGallery.tsx](../components/AlienLairGallery.tsx) uses Three.js + React Three Fiber for 3D NFT display.

## Developer Workflows
- **Setup:**
	- Add `.env.local` with `RARIBLE_API_KEY=...` (see README for value)
	- Restart dev server after changes to `.env.local`
- **Build/Run:**
	- `npm run dev` – Start dev server (http://localhost:3000)
	- `npm run build` – Build for production
	- `npm run start` – Start production server
	- `npm run lint` – Run ESLint
- **Debugging:**
	- Use browser DevTools → Network tab to inspect `/api/rarible/alien888-owned` requests
	- Check terminal logs for `[alien888-owned]` messages
	- See [RARIBLE_API_DEBUG.md](../RARIBLE_API_DEBUG.md) for troubleshooting

## Integration Points
- **Wallet:** RainbowKit/Wagmi (Ethereum mainnet, see [app/providers.tsx](../app/providers.tsx))
- **NFT Data:** Rarible Protocol v0.1 API (proxied via server API route)
- **3D/Visuals:** Three.js, React Three Fiber, Tailwind CSS

## Adding/Modifying Features
- Add new components to `/components/` with `'use client'` at the top
- Import types from [lib/RaribleService.ts](../lib/RaribleService.ts)
- Fetch data via the API proxy, not directly from Rarible
- Use emerald/fuchsia Tailwind classes for UI consistency
- For API changes, edit [app/api/rarible/alien888-owned/route.ts](../app/api/rarible/alien888-owned/route.ts) and [lib/RaribleService.ts](../lib/RaribleService.ts), then restart the dev server

## Deployment
- Vercel is recommended (Next.js optimized)
- Ensure `RARIBLE_API_KEY` is set in production env
- Only Ethereum mainnet is supported by default; update [app/providers.tsx](../app/providers.tsx) to add more chains

---
**For more details, see [README.md](../README.md) and [lib/RaribleService.ts](../lib/RaribleService.ts).**
