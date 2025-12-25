# Setup Guide - Fix the 502 Error

## Step 1: Create `.env.local` file

1. In your project root (same folder as `package.json`), create a new file named `.env.local`
2. Add this line (no quotes, no spaces around the `=`):
   ```
  RARIBLE_API_KEY=[REDACTED]
   ```
3. Save the file

## Step 2: Restart your dev server

1. Stop your current `npm run dev` (press `Ctrl+C` in the terminal)
2. Start it again: `npm run dev`
3. This is IMPORTANT - Next.js only reads `.env.local` when it starts!

## Step 3: Test it

1. Open your browser to `http://localhost:3000`
2. Connect your wallet
3. Check the browser console (F12 → Console tab)
4. Check the Network tab (F12 → Network) and look for `/api/rarible/alien888-owned`

## What should happen:

✅ **Success**: You should see NFTs loading in the Gallery
❌ **Still 502?**: Check the Network tab → click the failing request → look at the Response tab for the error detail

## Troubleshooting

- **"Server missing RARIBLE_API_KEY"**: The `.env.local` file isn't being read. Make sure:
  - File is named exactly `.env.local` (not `.env.local.txt`)
  - File is in the project root (same folder as `package.json`)
  - You restarted `npm run dev` after creating it

- **Still getting 403/401 from Rarible**: The API key might need to be configured in Rarible's dashboard to allow your domain

