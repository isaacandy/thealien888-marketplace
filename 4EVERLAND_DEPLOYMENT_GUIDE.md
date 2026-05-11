# 🚀 4EVERLAND Deployment Guide

**Status:** ✅ **BUILD READY FOR DEPLOYMENT**  
**Date:** December 26, 2025  
**Project:** TheAlien.888 Marketplace  

---

## 📝 **Documentation Note: 4EVERLAND Deployment**
This guide is a living document and should be updated by AI assistants and human contributors alike whenever significant changes to the project's deployment process, environment variables, or troubleshooting steps occur. This ensures a clear and consistent record of the project's deployment strategy, specifically for 4EVERLAND.

---

## 📋 Pre-Deployment Checklist (for 4EVERLAND)

- ✅ **Build Status:** Successful (`npm run build` completed)
- ✅ **Build Output:** `.next` folder generated with server, static, and types directories
- ✅ **Environment Variables:** Configured in `.env.local`
  - `RARIBLE_API_KEY` - Set and verified
  - `NEXT_PUBLIC_RARIBLE_API_KEY` - Set and verified
- ✅ **4EVERLAND Configuration:** Project settings configured correctly (or `4everland.json` if used)
- ✅ **Node Version:** 22 (as specified in project config or 4everland settings)
- ✅ **Package Manager:** npm with `--legacy-peer-deps` flag

---

## 🔧 Configuration Summary

### 4EVERLAND Build Settings (typically configured via UI or `4everland.json` if applicable):
```
# Example: 4everland.json (if used, otherwise configured via UI)
# {
#   "build": {
#     "command": "npm run build",
#     "outputDirectory": ".next"
#   },
#   "environment": {
#     "NPM_FLAGS": "--legacy-peer-deps",
#     "NODE_VERSION": "22"
#   }
# }
```

**Note:** 4EVERLAND typically auto-detects Next.js projects. Ensure the build command and publish directory are correctly set in the 4EVERLAND dashboard if not using a config file.

### Environment Variables Required on 4EVERLAND:
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

## 📦 4EVERLAND Deployment Steps

### **Step 1: Connect Repository to 4EVERLAND**

1. Go to 4EVERLAND Dashboard
2. Click **"New Project"** or similar option to deploy a new site.
3. Choose your Git provider (GitHub, GitLab, Bitbucket)
4. Select the repository: `thealien888-marketplace` (or parent repo)
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Framework:** Next.js (should be auto-detected)

### **Step 2: Set Environment Variables on 4EVERLAND**

In 4EVERLAND Dashboard:
1. Go to **Site Settings** → **Environment Variables**
2. Add the following variables:
   ```
   RARIBLE_API_KEY = [REDACTED]
   NEXT_PUBLIC_RARIBLE_API_KEY = [REDACTED]
   NPM_FLAGS = --legacy-peer-deps
   # Ensure NODE_VERSION is set in 4EVERLAND project settings, not directly here
   # as 4EVERLAND might have a dedicated field for it.
   NODE_VERSION = 22
   ```

### **Step 3: Deploy**
   - 4EVERLAND typically triggers a deployment automatically after configuration.
   - You can also manually trigger a deploy from the 4EVERLAND dashboard.

### **Step 4: Verify 4EVERLAND Deployment**

1. Wait for build to complete (usually 2-5 minutes)
2. Check the **Deployment Logs** or **Build History** in your 4EVERLAND project dashboard for status.
3. Visit your site URL (e.g., `https://your-project-name.4everland.app`)
4. Test key features:
   - ✅ Gallery loads
   - ✅ NFT data displays from Rarible API
   - ✅ Wallet connection works
   - ✅ No console errors

---

## 🐛 Troubleshooting (for 4EVERLAND)

**General Advice:** 4EVERLAND's build logs are your primary source of information for debugging.

### **Issue: Repository Cloning Failure**
- **Cause:** Often due to large repo size, network issues, or GitHub access permissions.
- **Solution:** Ensure 4EVERLAND has correct GitHub permissions. Check GitHub status. If repo is very large, consider Git LFS or optimizing repo size.

### **Issue: Build fails with "next not found"**
- **Solution:** Netlify should auto-install with `npm install --legacy-peer-deps`
- Ensure `NODE_VERSION=22` is set in 4EVERLAND project settings or environment variables.

### **Issue: Rarible API returns 403 (Forbidden)**
- **Cause:** Missing or invalid API key
- **Solution:** Verify `RARIBLE_API_KEY` in 4EVERLAND environment variables
- **Reference:** See `.env.local` for current key

### **Issue: Gallery component doesn't load**
- **Cause:** Missing `NEXT_PUBLIC_RARIBLE_API_KEY`
- **Solution:** Ensure both API keys are set in 4EVERLAND environment variables

### **Issue: Build succeeds but site shows "404" or incorrect content**
- **Cause:** Wrong publish directory or incorrect build output.
- **Solution:** Verify the "Output Directory" in 4EVERLAND settings is `.next`.

### **Issue: "Cannot find module" errors**
- **Cause:** Peer dependencies not resolved or Node.js version mismatch.
- **Solution:** Ensure `NPM_FLAGS = "--legacy-peer-deps"` is set in 4EVERLAND environment variables. Verify Node.js version is compatible (e.g., 22) in 4EVERLAND project settings.

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
   - Monitor site performance (using 4EVERLAND's analytics if available)

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
- **4EVERLAND Docs:** https://docs.4everland.org/
- **Rarible API Docs:** https://api.rarible.com/docs
- **Wagmi Docs:** https://wagmi.sh/
- **RainbowKit Docs:** https://www.rainbowkit.com/docs

---

**Ready to deploy? Connect your repository to Netlify and let it handle the rest! 🎉**
