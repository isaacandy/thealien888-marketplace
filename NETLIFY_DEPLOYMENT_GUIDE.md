# 🚀 Netlify Deployment Guide

**Status:** ✅ **BUILD READY FOR DEPLOYMENT**  
**Date:** December 26, 2025  
**Project:** TheAlien.888 Marketplace  

---

## 📋 Pre-Deployment Checklist

- ✅ **Build Status:** Successful (`npm run build` completed)
- ✅ **Build Output:** `.next` folder generated with server, static, and types directories
- ✅ **Environment Variables:** Configured in `.env.local`
  - `RARIBLE_API_KEY` - Set and verified
  - `NEXT_PUBLIC_RARIBLE_API_KEY` - Set and verified
- ✅ **Netlify Configuration:** `netlify.toml` configured correctly
- ✅ **Node Version:** 22 (as specified in netlify.toml)
- ✅ **Package Manager:** npm with `--legacy-peer-deps` flag

---

## 🔧 Configuration Summary

### netlify.toml Settings:
```toml
[build]
  command = "npm run build"
  publish = ".next"
  functions = "netlify/functions"

[build.environment]
  NPM_FLAGS = "--legacy-peer-deps"
  NODE_VERSION = "22"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Environment Variables Required on Netlify:
1. **RARIBLE_API_KEY** - For Rarible Protocol API access
   - Value: `[REDACTED]`
   - Type: Server-side only

2. **NEXT_PUBLIC_RARIBLE_API_KEY** - For client-side API calls
   - Value: `[REDACTED]`
   - Type: Public (visible to client)

3. **Optional - For Future Features:**
   - `ADMIN_PRIVATE_KEY` - For Web3 subdomain minting
   - `POLYGON_RPC_URL` - For Polygon network access
   - `ETHEREUM_RPC_URL` - For Ethereum network access

---

## 📦 Deployment Steps

### **Step 1: Connect Repository to Netlify**

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **"New site from Git"**
3. Choose your Git provider (GitHub, GitLab, Bitbucket)
4. Select the repository: `thealien888-marketplace` (or parent repo)
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Functions directory:** `netlify/functions`

### **Step 2: Set Environment Variables**

In Netlify Dashboard:
1. Go to **Site Settings** → **Environment Variables**
2. Add the following variables:
   ```
   RARIBLE_API_KEY = [REDACTED]
   NEXT_PUBLIC_RARIBLE_API_KEY = [REDACTED]
   NPM_FLAGS = --legacy-peer-deps
   NODE_VERSION = 22
   ```

### **Step 3: Deploy**

Option A: **Automatic Deployment (Recommended)**
- Push changes to your repository's main/master branch
- Netlify automatically builds and deploys

Option B: **Manual Deployment**
- In Netlify Dashboard → **Deploys** → **Trigger Deploy** → **Deploy Site**

### **Step 4: Verify Deployment**

1. Wait for build to complete (usually 2-5 minutes)
2. Check the **Deploys** tab for status
3. Visit your site URL (e.g., `https://thealien888-marketplace.netlify.app`)
4. Test key features:
   - ✅ Gallery loads
   - ✅ NFT data displays from Rarible API
   - ✅ Wallet connection works
   - ✅ No console errors

---

## 🐛 Troubleshooting

### **Issue: Build fails with "next not found"**
- **Solution:** Netlify should auto-install with `npm install --legacy-peer-deps`
- Ensure `NODE_VERSION=22` is set in environment variables

### **Issue: Rarible API returns 403 (Forbidden)**
- **Cause:** Missing or invalid API key
- **Solution:** Verify `RARIBLE_API_KEY` in Netlify environment variables
- **Reference:** See `.env.local` for current key

### **Issue: Gallery component doesn't load**
- **Cause:** Missing `NEXT_PUBLIC_RARIBLE_API_KEY`
- **Solution:** Ensure both API keys are set in environment variables

### **Issue: Build succeeds but site shows "404"**
- **Cause:** Wrong publish directory
- **Solution:** Verify `publish = ".next"` in netlify.toml

### **Issue: "Cannot find module" errors**
- **Cause:** Peer dependencies not resolved
- **Solution:** Ensure `NPM_FLAGS = "--legacy-peer-deps"` is set

---

## 📊 Build Details

### **Build Output Size:**
- `.next/server/` - Server-side code and API routes
- `.next/static/` - Client-side JavaScript and CSS
- `.next/types/` - TypeScript definitions
- `Total estimated size: ~50-100MB` (will be optimized by Netlify)

### **Key Files Included:**
- ✅ Next.js App Router (app/ directory)
- ✅ API Routes (app/api/)
- ✅ React Components (components/)
- ✅ Tailwind CSS (global styles)
- ✅ Three.js 3D Gallery
- ✅ Wagmi + RainbowKit Web3 integration

---

## 🔐 Security Notes

1. **Never commit .env.local to Git**
   - `.gitignore` should include `.env.local`
   - Use Netlify environment variables instead

2. **API Key Security**
   - `RARIBLE_API_KEY` is server-side only (secure)
   - `NEXT_PUBLIC_RARIBLE_API_KEY` is public (for client API calls)
   - Both should be treated as "exposed" to prevent misuse

3. **Rate Limiting**
   - Rarible API has rate limits (100+ requests/minute)
   - Marketplace implements validation in `app/api/rarible/alien888-owned/route.ts`
   - Monitor API usage in Rarible dashboard

---

## 📝 Post-Deployment Checklist

- [ ] Site loads without errors
- [ ] Gallery displays NFTs from Rarible API
- [ ] Wallet connection works (RainbowKit modal appears)
- [ ] Can view individual NFT details
- [ ] Subdomain claim page loads
- [ ] Staking interface appears (demo mode)
- [ ] 3D Lair gallery loads (if enabled)
- [ ] No console errors in browser DevTools
- [ ] Performance is acceptable (Lighthouse score > 50)

---

## 🚀 Next Steps After Deployment

1. **Monitor Netlify Analytics**
   - Track build times and deploy frequency
   - Monitor site performance

2. **Set up Domain**
   - Connect custom domain (e.g., `marketplace.thealien888.iznd.xyz`)
   - Enable HTTPS (automatic with Netlify)

3. **Update Parent Site Links**
   - Update navigation in parent `TheAlien888-Site.-Front-end-module`
   - Link from `gallery.html` → new Netlify marketplace URL

4. **Implement Advanced Features**
   - Staking with real $TA8 rewards
   - Web3 subdomain minting integration
   - Activity feed from Rarible API
   - Advanced trading features

---

## 📞 Support & Resources

- **Netlify Docs:** https://docs.netlify.com/
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Rarible API Docs:** https://api.rarible.com/docs
- **Wagmi Docs:** https://wagmi.sh/
- **RainbowKit Docs:** https://www.rainbowkit.com/docs

---

**Ready to deploy? Connect your repository to Netlify and let it handle the rest! 🎉**

