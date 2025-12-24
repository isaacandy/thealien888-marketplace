import { NextRequest, NextResponse } from 'next/server';
import {
  fetchAlien888ItemsByOwner,
  FetchCollectionItemsResult,
} from '@/lib/RaribleService';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get('owner');
  const continuation = searchParams.get('continuation') ?? undefined;
  const sizeParam = searchParams.get('size');

  if (!owner) {
    return NextResponse.json(
      { error: 'Missing owner address' },
      { status: 400 },
    );
  }




  // Validate size parameter: must be a positive integer
  let size: number | undefined = undefined;
  if (sizeParam) {
    const parsed = Number(sizeParam);
    // Check if it's a valid positive integer (not NaN, not negative, not zero, not a float)
    if (
      !isNaN(parsed) &&
      parsed > 0 &&
      Number.isInteger(parsed) &&
      parsed <= 100
    ) {
      size = parsed;
    } else {
      return NextResponse.json(
        {
          error:
            'Invalid size parameter. Must be a positive integer between 1 and 100.',
        },
        { status: 400 },
      );
    }
  }

  try {
    // Log the params being sent
    console.log('[alien888-owned] Fetching for owner:', owner, 'size:', size, 'continuation:', continuation);
    const data: FetchCollectionItemsResult = await fetchAlien888ItemsByOwner(
      owner,
      { size, continuation },
    );
    console.log('[alien888-owned] Rarible API returned:', data && data.items ? data.items.length : 'no items', 'items');
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: unknown) {
    // If error is from fetchAlien888ItemsByOwner, log more details
    console.error('[alien888-owned] Error fetching Alien888 items by owner:', error);
    if (error instanceof Error && (error as any).response) {
      try {
        const errRes = await (error as any).response.json();
        console.error('[alien888-owned] Rarible API error response:', errRes);
      } catch (e) {
        // ignore
      }
    }
    const message =
      error instanceof Error ? error.message : 'Failed to fetch items';
    const stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      { error: 'Failed to fetch items from Rarible', detail: message, stack: stack },
      { status: 502 },
    );
  }
}


