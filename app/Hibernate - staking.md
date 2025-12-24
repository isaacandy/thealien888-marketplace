---
# Hibernate Staking: Gas Fee Handling

Yes, you can absolutely have the user pay for the gas fees instead of absorbing them yourself. This is a common practice that shifts the transaction cost to the person receiving the value of the new asset.

To implement this, you will need to move the minting logic from your **Server-Side API** to the **Client-Side Component**.

This video is relevant because it demonstrates the standard user-facing steps for minting and managing Unstoppable Domains, which aligns with shifting those tasks (and their costs) to the end-user.

Yes, you can absolutely have the user pay for the gas fees instead of absorbing them yourself. This is a common practice that shifts the transaction cost to the person receiving the value of the new asset.

To implement this, you will need to move the minting logic from your **Server-Side API** to the **Client-Side Component**.

### Why the current setup "absorbs" fees

In your current `app/api/mint-subdomain/route.ts`, the server uses an `adminAccount` (loaded via a private key) to sign and send the transaction. Since the server initiates the transaction, it must provide the MATIC/gas to the network from that admin wallet.

### How to shift fees to the user

Instead of the server calling `writeContract`, your frontend should request the user's connected wallet (e.g., MetaMask) to sign and pay for the transaction.

#### 1. Modify the Frontend (`components/SubdomainClaim.tsx`)

You will use the `useWriteContract` hook from **Wagmi**. When the user clicks "Mint," their wallet will pop up and ask them to confirm the transaction and pay the gas fee.

```typescript
// Add this hook to your component
const { writeContract } = useWriteContract();

const handleMint = async () => {
  // Call the Unstoppable Domains contract directly from the user's wallet
  writeContract({
    address: '0xc37d3c4326ab0e1d2b9d8b916bbdf5715f780fcf', // Minting Manager
    abi: MINTING_MANAGER_ABI,
    functionName: 'issueWithRecords',
    args: [accountAddress, [subdomain, 'thealien', '888'], [], []],
  });
};

```

#### 2. Update the Backend (`app/api/mint-subdomain/route.ts`)

The backend should no longer send the transaction. Instead, it should only be used for:

* **Validation**: Checking if the user actually owns the required TheAlien.888 NFT.
* **Availability**: Checking if the desired subdomain is already taken.

### Comparison of Flows

| Feature | Your Current Flow (Server-Paid) | New Flow (User-Paid) |
| --- | --- | --- |
| **Transaction Signer** | Your Admin Wallet | User's Wallet (MetaMask, etc.) |
| **Gas Fee Payer** | You (from your admin wallet) | The User |
| **Security** | Requires keeping private key on server | No admin private key needed on server |
| **User Experience** | Seamless "Free" mint for user | User must have MATIC for gas |

**Would you like me to provide the full rewritten code for both the `SubdomainClaim.tsx` and the `route.ts` to implement this user-paid flow?**

For a broader look at managing these domains, this [Unstoppable Domains guide](https://www.youtube.com/watch?v=xPNsHOnbRU4) covers searching, buying, and setting up domains for Web3 identity.

This video is relevant because it demonstrates the standard user-facing steps for minting and managing Unstoppable Domains, which aligns with shifting those tasks (and their costs) to the end-user.