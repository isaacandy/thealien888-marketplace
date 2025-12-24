// GET /api/rarible/bid?contract=...&tokenId=...&continuation=...&size=...
// Follows Rarible API best practices: https://docs.rarible.org/reference/order-controller_get-orders-all
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contract = searchParams.get('contract');
  const tokenId = searchParams.get('tokenId');
  const continuation = searchParams.get('continuation') || undefined;
  const size = searchParams.get('size') || '20';

  if (!contract || !tokenId) {
    return NextResponse.json({ error: 'Missing contract or tokenId' }, { status: 400 });
  }

  // Rarible API endpoint for order bids (offers) for a token (see docs)
  let url = `https://api.rarible.org/v0.1/orders/all?make.assetType.assetClass=ERC721&make.assetType.contract=${contract}&make.assetType.tokenId=${tokenId}&type=BID&size=${size}`;
  if (continuation) url += `&continuation=${encodeURIComponent(continuation)}`;

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        ...(process.env.RARIBLE_API_KEY ? { 'X-API-KEY': process.env.RARIBLE_API_KEY } : {}),
      },
    });
    if (res.status === 429) {
      return NextResponse.json({ error: 'Rate limited by Rarible API' }, { status: 429 });
    }
    if (!res.ok) {
      let errorBody = null;
      try {
        errorBody = await res.json();
      } catch {}
      console.error('[bid] Rarible API error:', res.status, res.statusText, errorBody);
      return NextResponse.json({ error: 'Failed to fetch bids', status: res.status, detail: errorBody }, { status: 502 });
    }
    const data = await res.json();
    // Map to Rarible Order Data Model: https://docs.rarible.org/reference/order-data-model
    const bids = (data.orders || []).map((order: any) => ({
      id: order.id,
      maker: order.maker,
      value: order.take && order.take.value ? String(Number(order.take.value) / 1e18) : undefined,
      price: order.take && order.take.value ? String(Number(order.take.value) / 1e18) : undefined,
      date: order.createdAt,
      hash: order.hash,
      details: order,
    }));
    return NextResponse.json({ bids, continuation: data.continuation });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch bids', exception: String(e) }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
