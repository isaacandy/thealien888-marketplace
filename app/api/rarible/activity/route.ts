import { NextRequest, NextResponse } from 'next/server';
// Fix for process not found in Next.js edge/serverless
type ProcessWithEnv = NodeJS.Process & { env: NodeJS.ProcessEnv };
const _process: ProcessWithEnv | undefined = typeof globalThis !== 'undefined' && typeof (globalThis as unknown as { process?: unknown }).process !== 'undefined'
  ? (globalThis as unknown as { process: ProcessWithEnv }).process
  : undefined;

// GET /api/rarible/activity?contract=...&tokenId=...&continuation=...
// Follows Rarible API best practices: https://docs.rarible.org/reference/activity-controller_get-activities-by-item
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contract = searchParams.get('contract');
  const tokenId = searchParams.get('tokenId');
  const continuation = searchParams.get('continuation') || undefined;
  const size = searchParams.get('size') || '30';

  if (!contract || !tokenId) {
    return NextResponse.json({ error: 'Missing contract or tokenId' }, { status: 400 });
  }

  // Rarible API endpoint for NFT activities (see docs)
  let url = `https://api.rarible.org/v0.1/items/${contract}:${tokenId}/activities?size=${size}`;
  if (continuation) url += `&continuation=${encodeURIComponent(continuation)}`;

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        ...(_process && _process.env && (( _process.env as unknown as Record<string, string | undefined>)["RARIBLE_API_KEY"])
          ? { 'X-API-KEY': (_process.env as unknown as Record<string, string | undefined>)["RARIBLE_API_KEY"] }
          : {}),
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
      console.error('[activity] Rarible API error:', res.status, res.statusText, errorBody);
      return NextResponse.json({ error: 'Failed to fetch activity', status: res.status, detail: errorBody }, { status: 502 });
    }
    const data = await res.json();
    // Map to Rarible Activity Data Model: https://docs.rarible.org/reference/activity-data-model
    const activity = (data.activities || []).map((act: {
      id?: string;
      type?: string;
      maker?: string;
      owner?: string;
      from?: string;
      to?: string;
      price?: string | number;
      priceUsd?: string | number;
      date?: string;
      transactionHash?: string;
      [key: string]: unknown;
    }) => ({
      id: act.id,
      type: act.type,
      user: {
        address: act.maker || act.owner || act.from || act.to || '',
        // Optionally resolve avatar/ENS here if needed
      },
      value: act.price ? String(Number(act.price) / 1e18) : undefined,
      usd: act.priceUsd,
      date: act.date,
      hash: act.transactionHash,
      details: act,
    }));
    return NextResponse.json({ activity, continuation: data.continuation });
  } catch (e) {
    console.error('[activity] Exception:', e);
    return NextResponse.json({ error: 'Failed to fetch activity', exception: String(e) }, { status: 500 });
  }
}
