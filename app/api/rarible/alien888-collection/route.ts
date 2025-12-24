import { NextRequest, NextResponse } from 'next/server';
import { fetchAlien888Items, FetchCollectionItemsResult } from '@/lib/RaribleService';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const continuation = searchParams.get('continuation') ?? undefined;
  const sizeParam = searchParams.get('size');

  // Validate size parameter: must be a positive integer
  let size: number | undefined = undefined;
  if (sizeParam) {
    const parsed = Number(sizeParam);
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
    const data: FetchCollectionItemsResult = await fetchAlien888Items({ size, continuation });
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching Alien888 collection items', error);
    const message =
      error instanceof Error ? error.message : 'Failed to fetch items';
    const stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      {
        error: 'Failed to fetch collection items from Rarible',
        detail: message,
        stack: stack,
        size,
      },
      { status: 502 },
    );
  }
}