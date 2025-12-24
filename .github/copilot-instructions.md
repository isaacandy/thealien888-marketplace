# Copilot Instructions - TheAlien.888 Marketplace

## Project Overview
A Next.js 16 + TypeScript NFT marketplace interface for the **TheAlien.888** collection on Ethereum. The app connects via RainbowKit/Wagmi wallet integration and fetches NFT data from the Rarible Protocol v0.1 API. The UI uses Tailwind CSS with a dark cyberpunk aesthetic (emerald/fuchsia green theme).

**Collection ID**: `ETHEREUM:0x295a6a847e3715f224826aa88156f356ac523eef`

## Architecture

### Data Flow
1. **Client-side wallet connection** (RainbowKit/Wagmi in `providers.tsx`)
2. **Client components** (Gallery, Staking, SubdomainClaim in `/components/`) read user's wallet address
3. **API proxy** (`/app/api/rarible/alien888-owned`) calls Rarible with server-side API key
4. **RaribleService** (`/lib/RaribleService.ts`) contains core API logic and TypeScript interfaces

### Key Components
- **Gallery.tsx**: Tabbed interface with "My Collection" (user's NFTs with management actions: List, View, Offer) and "All Collection" (marketplace view - coming soon); fetches from `/api/rarible/alien888-owned` with `size=50`
- **Staking.tsx**: Shows selectable NFT list (`size=24`) with staking simulation UI
- **SubdomainClaim.tsx**: Checks ownership eligibility, persists choice to localStorage
- **AlienLairGallery.tsx**: 3D gallery view (uses Three.js + React Three Fiber)

### Critical Files
- [lib/RaribleService.ts](../lib/RaribleService.ts): API client, types (`RaribleItem`, `RaribleItemMeta`, `RaribleCollection`), `resolveItemImageUrl()` for image handling, client-side collection filtering
- [app/api/rarible/alien888-owned/route.ts](../app/api/rarible/alien888-owned/route.ts): Server-side wrapper; validates `owner` param, checks `RARIBLE_API_KEY` env var, rate-limits `size` to 1-100, adds Referer header
- [app/providers.tsx](../app/providers.tsx): Wagmi config (mainnet only), RainbowKit theming, React Query setup

## Environment & Build

### Setup Commands
```bash
npm run dev      # Start dev server on http://localhost:3000
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Critical Environment Variable
**`.env.local` is required** (not checked in):
```
RARIBLE_API_KEY=afdf41ce-b697-447c-b5bf-f9340315e7f0
```
⚠️ **Important Setup Notes**:
- Dev server must be **restarted** after adding `.env.local` for Next.js to read it
- Rarible API key must allow `localhost:3000` in its referer whitelist (configure at https://rarible.com/dev/settings)
- The key's referer restrictions can block localhost; add `http://localhost:3000` to allowed domains if getting 403 errors

### Dependencies
- **Web3**: `wagmi@2.19`, `viem@2.42`, `@rainbow-me/rainbowkit@2.2`
- **Data**: `@tanstack/react-query@5.90` (for async state)
- **UI**: `tailwindcss@4`, `framer-motion@12`, `lucide-react` (icons)
- **3D**: `three@0.182`, `@react-three/fiber@9.4`, `@react-three/drei@10.7`
- **Framework**: `next@16`, `react@19`

## Project Conventions

### API Error Handling
- Server API route returns 400 for missing/invalid params; 500 if `RARIBLE_API_KEY` missing
- Client components set `error` state and display in UI; use `cancelled` flag to prevent state updates after unmount
- Check [RARIBLE_API_DEBUG.md](../RARIBLE_API_DEBUG.md) for troubleshooting endpoint issues

### Client Components Pattern
- All user-facing components use `'use client'` directive
- Read wallet via `useAccount()` from Wagmi
- Fetch from `/api/rarible/alien888-owned` with URLSearchParams (e.g., `?owner=0x...&size=50`)
- Manage loading/error/items state; cleanup with `cancelled` flag in useEffect cleanup

### Styling
- **Color scheme**: Emerald (success/primary `emerald-500`) + fuchsia (accent `fuchsia-500`) on black
- **Shadows**: Glow effects use `shadow-[0_0_Xpx_rgba(...)` for neon look
- **Layout**: max-w-6xl container, responsive via `sm:` breakpoints (Tailwind CSS v4)

### TypeScript
- Strict types in `RaribleService.ts`: `RaribleItem`, `RaribleItemMeta`, `FetchOwnerItemsOptions`
- Prefer named interfaces over inline types
- No `any`; use `T` generics for `fetchJson<T>()`

## Common Tasks

### Adding a New Component
1. Create file in `/components/` with `'use client'` at top
2. Use `useAccount()` for wallet checks; import types from `RaribleService.ts`
3. Fetch via `/api/rarible/alien888-owned` route
4. Apply emerald/fuchsia Tailwind classes; use Tailwind v4 PostCSS

### Debugging Rarible API Issues
1. Check `.env.local` exists with correct key
2. Restart `npm run dev`
3. Open browser DevTools → Network tab; inspect `/api/rarible/alien888-owned` request/response
4. Check server logs in terminal for `Rarible API Request:` / `Rarible API Error:` messages
5. Verify endpoint format in [RARIBLE_API_DEBUG.md](../RARIBLE_API_DEBUG.md)

### Modifying API Proxy
- Edit [app/api/rarible/alien888-owned/route.ts](../app/api/rarible/alien888-owned/route.ts) to change params/validation
- Add/remove fields from interfaces in [lib/RaribleService.ts](../lib/RaribleService.ts)
- Restart dev server; test with browser Network tab

### Styling New Elements
- Import Tailwind in `app/globals.css`; apply classes directly in JSX
- Use v4 PostCSS syntax; no `@apply` needed
- Dark theme is default in `layout.tsx` (body has `bg-black text-emerald-100`)
- Glow effects: `shadow-[0_0_15px_rgba(52,211,153,0.8)]` for emerald or `shadow-[0_0_45px_rgba(16,185,129,0.45)]`

## Deployment Notes
- Vercel is the recommended host (Next.js team)
- Ensure `RARIBLE_API_KEY` is set in production environment variables
- Only Ethereum mainnet is currently configured; adjust `mainnet` import in `providers.tsx` to add other chains
