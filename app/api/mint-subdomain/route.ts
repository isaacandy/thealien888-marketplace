import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, createWalletClient, http, erc721Abi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet, polygon } from 'viem/chains';

const NFT_CONTRACT_ADDRESS = '0x295a6a847e3715f224826aa88156f356ac523eef';
const MINTING_MANAGER_ADDRESS = '0xc37d3c4326ab0e1d2b9d8b916bbdf5715f780fcf';

// MintingManager ABI for issueWithRecords
const MINTING_MANAGER_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'string[]', name: 'labels', type: 'string[]' },
      { internalType: 'string[]', name: 'keys', type: 'string[]' },
      { internalType: 'string[]', name: 'values', type: 'string[]' },
    ],
    name: 'issueWithRecords',
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const ethClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.ETHEREUM_RPC_URL),
});

export async function POST(req: NextRequest) {
  try {
    const { recipientAddress, subdomain } = await req.json();

    // Validate required fields
    if (!recipientAddress) {
      return NextResponse.json({ error: 'recipientAddress is required.' }, { status: 400 });
    }

    if (!subdomain) {
      return NextResponse.json({ error: 'subdomain is required.' }, { status: 400 });
    }

    // Verify ownership on Ethereum Mainnet before allowing mint
    const balance = await ethClient.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: erc721Abi,
      functionName: 'balanceOf',
      args: [recipientAddress],
    });

    if (Number(balance) === 0) {
      return NextResponse.json({ error: 'User does not own the required NFT.' }, { status: 403 });
    }

    // Validate ADMIN_PRIVATE_KEY is set
    if (!process.env.ADMIN_PRIVATE_KEY) {
      return NextResponse.json({ error: 'ADMIN_PRIVATE_KEY is not configured.' }, { status: 500 });
    }

    // Validate POLYGON_RPC_URL is set
    if (!process.env.POLYGON_RPC_URL) {
      return NextResponse.json({ error: 'POLYGON_RPC_URL is not configured.' }, { status: 500 });
    }

    // Initialize the Minter Wallet (Hot Wallet) using ADMIN_PRIVATE_KEY
    const minterAccount = privateKeyToAccount(process.env.ADMIN_PRIVATE_KEY as `0x${string}`);

    // Create wallet client connected to Polygon
    const polygonWalletClient = createWalletClient({
      account: minterAccount,
      chain: polygon,
      transport: http(process.env.POLYGON_RPC_URL),
    });

    // Call issueWithRecords on MintingManager contract
    // The transaction is sent from Minter Wallet, but mints under parent domain owned by Ledger
    // This works because setApprovalForAll was already performed on the UNS Registry
    const hash = await polygonWalletClient.writeContract({
      address: MINTING_MANAGER_ADDRESS,
      abi: MINTING_MANAGER_ABI,
      functionName: 'issueWithRecords',
      args: [
        recipientAddress, // to: recipient address
        [subdomain, 'thealien', '888'], // labels: subdomain + parent domain labels
        [], // keys: empty array for no records
        [], // values: empty array for no records
      ],
    });

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      message: 'Subdomain minted successfully',
    });
  } catch (error: any) {
    console.error('Minting Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to mint subdomain',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}