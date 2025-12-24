# Implementation Plan: Web3 Subdomain Minting (Hybrid Model)

**Project:** TheAlien.888 Subdomain Claim
**Parent Domain:** `thealien.888` (Polygon)
**NFT Collection:** `0x295a6a847e3715f224826aa88156f356ac523eef` (Ethereum Mainnet)
**Target Network:** Polygon (MATIC)

---

## 1. System Architecture

We are using a **Hybrid Minting Model** to balance cost and user experience:

1. **Standard Mint (Default):**
* **Format:** `[TokenID].thealien.888` (e.g., `888.thealien.888`)
* **Payer:** Admin (Server-side wallet).
* **Mechanism:** Direct interaction with UD `MintingManager` via Backend API.


2. **Custom Mint (Premium):**
* **Format:** `[CustomName].thealien.888` (e.g., `skywalker.thealien.888`)
* **Payer:** User (Client-side wallet).
* **Mechanism:** Signature-based "Voucher" submitted to a custom Proxy Contract.



---

## 2. Prerequisites & Setup

### A. Wallets

1. **Owner Wallet (Ledger):** Holds the parent domain `thealien.888`.
2. **Minter Wallet (Hot Wallet):** A fresh MetaMask account.
* *Action:* Export Private Key for `.env`.
* *Action:* Fund with ~5 MATIC for gas.



### B. Smart Contracts

1. **Unstoppable Domains Registry (Existing):**
* Address: `0xa9a6A3626993D987F45a3127af12e366aF3D9023` (Verify on UD docs/PolygonScan).


2. **Custom Proxy Contract (New):**
* *Action:* Deploy `AlienMinter.sol` to Polygon using Remix.
* *Constructor:* Pass the **Minter Wallet** address as the `_signerWallet`.



### C. On-Chain Permissions (Critical)

Using the **Owner Wallet (Ledger)**, call `setApprovalForAll` on the UD Registry for **two** operators:

1. **Operator 1:** The Minter Wallet Address.
2. **Operator 2:** The Custom Proxy Contract Address.

---

## 3. Environment Variables (`.env.local`)

```bash
# Security: NEVER commit this file to Git
# 1. The Hot Wallet Private Key (Minter Wallet)
ADMIN_PRIVATE_KEY=your_hot_wallet_private_key

# 2. RPC URL for Polygon (Get from Infura/Alchemy - Rotate keys if exposed!)
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/YOUR_API_KEY

# 3. Contract Addresses
NEXT_PUBLIC_PROXY_CONTRACT_ADDRESS=0x_your_deployed_proxy_address
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x295a6a847e3715f224826aa88156f356ac523eef

```

---

## 4. Database Schema (Supabase / JSON / SQL)

To track redemption and prevent double-minting:

**Table:** `claimed_subdomains`

| Column | Type | Description |
| --- | --- | --- |
| `token_id` | Integer | **Primary Key**. The NFT ID (e.g., 888). |
| `subdomain` | String | The full minted name. |
| `owner_address` | String | Wallet that claimed it. |
| `mint_type` | String | 'standard' or 'custom'. |
| `tx_hash` | String | Transaction hash on Polygon. |
| `created_at` | Timestamp | Date of claim. |

---

## 5. Development Tasks (For Cursor/VS Code)

### Task A: The Backend API (`/api/mint-manager`)

**Goal:** Handle validation, standard minting, and voucher signing.

* **Logic:**
1. Validate User owns `token_id` on Ethereum Mainnet (Read-only check).
2. Check DB: Ensure `token_id` is not in `claimed_subdomains`.
3. **If Standard Mint (req.body.type == 'standard'):**
* Initialize Wallet using `ADMIN_PRIVATE_KEY`.
* Call UD `MintingManager.issueWithRecords(userAddr, [tokenID, "thealien", "888"], ...)`
* Write to DB on success.
* Return: `{ success: true, txHash }`.


4. **If Custom Mint (req.body.type == 'custom'):**
* Generate Signature: `sign(keccak256(userAddr, customLabel))`.
* Write to DB (mark as 'pending' or 'claimed').
* Return: `{ success: true, signature }`.





### Task B: The Proxy Contract (`AlienMinter.sol`)

**Goal:** Allow users to mint custom names by paying gas, verifying the server's signature.

* **Core Function:** `mintSubdomain(string label, bytes signature)`
* **Verification:** `recoverSigner(hash, signature) == signerWallet`
* **Execution:** Call UD `issueWithRecords` using the contract's delegated permission.

### Task C: The Frontend Component

**Goal:** UI for selection and interaction.

1. **Ownership Check:** Read user's NFT balance/IDs via `wagmi`.
2. **Status Display:** Show which IDs are "Available" vs "Claimed".
3. **Toggle:** "Standard (Free)" vs "Custom (Pay Gas)".
4. **Interaction:**
* *Standard:* `POST /api/mint-manager` -> Wait for server response.
* *Custom:* `POST /api/mint-manager` -> Get Sig -> `contract.write.mintSubdomain(...)`.



---

## 6. Implementation Checklist

* [ ] **Deploy Proxy Contract** (`AlienMinter.sol`) on Polygon.
* [ ] **Delegate Permissions** (Ledger signs `setApprovalForAll` for Wallet & Proxy).
* [ ] **Configure .env** (RPCs and Private Keys).
* [ ] **Build API Route** (Validation + Minting Logic).
* [ ] **Build Frontend UI** (Wallet Connect + Mint Widget).
* [ ] **Test Standard Mint** (Server pays gas).
* [ ] **Test Custom Mint** (User pays gas).