export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

const CURRENCIES_TO_STORE = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'AUD', 'SGD'] as const;
const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

type RatesMap = Record<string, number>;

function pickRates(all: RatesMap): RatesMap {
  const result: RatesMap = {};
  for (const code of CURRENCIES_TO_STORE) {
    if (typeof all[code] === 'number') result[code] = all[code];
  }
  return result;
}

export async function GET() {
  try {
    const { prisma } = await import('@/lib/db');

    // Check DB for a fresh record (fetched within the last 4 hours)
    const latest = await prisma.currencyRate.findFirst({
      orderBy: { fetchedAt: 'desc' },
    });

    const isFresh =
      latest &&
      Date.now() - new Date(latest.fetchedAt).getTime() < FOUR_HOURS_MS;

    if (isFresh && latest) {
      return NextResponse.json(
        { rates: latest.rates as RatesMap, fetchedAt: latest.fetchedAt },
        {
          headers: {
            'Cache-Control': 's-maxage=14400, stale-while-revalidate',
          },
        },
      );
    }

    // Stale or missing — fetch from open.er-api.com (free, no key needed)
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/THB', {
        next: { revalidate: 0 }, // bypass Next.js fetch cache, we handle our own
      });

      if (!res.ok) throw new Error(`er-api responded ${res.status}`);

      const json = await res.json();
      if (json.result !== 'success' || !json.rates) {
        throw new Error('Unexpected response shape from er-api');
      }

      const rates = pickRates(json.rates as RatesMap);

      // Persist to DB — keep only one row per base currency to prevent unbounded table growth
      // NOTE: after running `prisma migrate dev` to apply the @@unique([base]) constraint,
      // this can be simplified to a single prisma.currencyRate.upsert({ where: { base: 'THB' } })
      const existingRate = await prisma.currencyRate.findFirst({ where: { base: 'THB' } });
      if (existingRate) {
        await prisma.currencyRate.update({
          where: { id: existingRate.id },
          data:  { rates, fetchedAt: new Date() },
        });
      } else {
        await prisma.currencyRate.create({ data: { base: 'THB', rates } });
      }

      return NextResponse.json(
        { rates, fetchedAt: new Date().toISOString() },
        {
          headers: {
            'Cache-Control': 's-maxage=14400, stale-while-revalidate',
          },
        },
      );
    } catch (fetchErr) {
      // Fetch failed — return last cached rates even if stale
      if (latest) {
        return NextResponse.json(
          {
            rates: latest.rates as RatesMap,
            fetchedAt: latest.fetchedAt,
            stale: true,
          },
          {
            headers: {
              'Cache-Control': 's-maxage=14400, stale-while-revalidate',
            },
          },
        );
      }

      // No cached rates at all — return static fallback
      const fallback: RatesMap = {
        USD: 0.0274,
        EUR: 0.0254,
        GBP: 0.0217,
        CNY: 0.197,
        JPY: 4.1,
        AUD: 0.042,
        SGD: 0.037,
      };
      return NextResponse.json(
        { rates: fallback, fetchedAt: null, stale: true },
        {
          headers: {
            'Cache-Control': 's-maxage=14400, stale-while-revalidate',
          },
        },
      );
    }
  } catch (dbErr) {
    // DB not available at all — return static fallback
    const fallback: RatesMap = {
      USD: 0.0274,
      EUR: 0.0254,
      GBP: 0.0217,
      CNY: 0.197,
      JPY: 4.1,
      AUD: 0.042,
      SGD: 0.037,
    };
    return NextResponse.json(
      { rates: fallback, fetchedAt: null, stale: true },
      {
        headers: {
          'Cache-Control': 's-maxage=14400, stale-while-revalidate',
        },
      },
    );
  }
}
