import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { fetchTokenPairs, fetchPairFromUrl } from '@/lib/dexscreener'

type TokenWithMarket = {
  address: string
  name: string
  symbol: string
  quoteSymbol?: string
  pairLabel?: string
  image: string | null
  source: 'community'
  clankerUrl: undefined
  explorerUrl: string
  dexScreenerUrl: string
  createdAt: string
  marketData: Awaited<ReturnType<typeof fetchTokenPairs>> | undefined
}

type PairInfo = {
  image?: string
  quoteSymbol?: string
  labels?: string[]
}

const MIN_VOLUME = 1
const MAX_TOKENS_TO_FETCH = 30
const DEXSCREENER_CONCURRENCY = 10
/** DexScreener: 60 req/min. With 30 tokens, 1 call each (pairInfo cached 5min) = 30/min. */
const MARKET_CACHE_TTL_MS = 45 * 1000 // 45s - 30 tokens = ~40/min, under 60 limit
const PAIR_INFO_CACHE_TTL_MS = 5 * 60 * 1000 // 5 min - image/quoteSymbol rarely change
const marketCache = new Map<
  string,
  { data: NonNullable<Awaited<ReturnType<typeof fetchTokenPairs>>>; expires: number }
>()
const pairInfoCache = new Map<string, { data: PairInfo; expires: number }>()

function getCached(address: string) {
  const e = marketCache.get(address.toLowerCase())
  if (!e || Date.now() > e.expires) return undefined
  return e.data
}

function setCached(address: string, data: NonNullable<Awaited<ReturnType<typeof fetchTokenPairs>>>) {
  marketCache.set(address.toLowerCase(), { data, expires: Date.now() + MARKET_CACHE_TTL_MS })
}

async function runWithConcurrency<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = []
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency)
    const chunkResults = await Promise.all(chunk.map(fn))
    results.push(...chunkResults)
  }
  return results
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const minVolume = parseFloat(searchParams.get('minVolume') ?? '1') || 1
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10) || 20, 100)
    const offset = Math.max(parseInt(searchParams.get('offset') ?? '0', 10) || 0, 0)
    const sort = (searchParams.get('sort') ?? 'trending') as
      | 'trending'
      | 'new'
      | 'gainers'
      | 'mcap'
      | 'volume'

    const approved = await prisma.submission.findMany({
      where: { status: 'approved' },
      include: { votes: true },
      orderBy: { approvedAt: 'desc' },
      take: MAX_TOKENS_TO_FETCH,
    })

    // Fast path: no tokens → return immediately (no DexScreener calls)
    if (approved.length === 0) {
      return NextResponse.json({
        tokens: [],
        total: 0,
        totalVolume: 0,
        totalTxns: 0,
      })
    }

    const fetchOne = async (s: { tokenAddress: string; name: string; symbol: string; image: string | null; dexScreenerUrl: string; createdAt: Date }) => {
      let market = getCached(s.tokenAddress)
      if (!market) {
        market = await fetchTokenPairs(s.tokenAddress) ?? undefined
        if (market) setCached(s.tokenAddress, market)
      }

      // Fetch full pair info (image, quoteSymbol, labels) from DexScreener URL
      let image = s.image
      let quoteSymbol: string | undefined
      let pairLabel: string | undefined
      if (s.dexScreenerUrl) {
        const cached = pairInfoCache.get(s.dexScreenerUrl)
        if (cached && Date.now() < cached.expires) {
          image = cached.data.image ?? image
          quoteSymbol = cached.data.quoteSymbol
          pairLabel = cached.data.labels?.[0]
        } else {
          const pairInfo = await fetchPairFromUrl(s.dexScreenerUrl)
          if (pairInfo) {
            if (pairInfo.image?.includes('/cms/images')) image = pairInfo.image
            quoteSymbol = pairInfo.quoteSymbol
            pairLabel = pairInfo.labels?.[0]
            pairInfoCache.set(s.dexScreenerUrl, {
              data: { image: image ?? undefined, quoteSymbol, labels: pairInfo.labels },
              expires: Date.now() + PAIR_INFO_CACHE_TTL_MS,
            })
          }
        }
      }
      if (!image) image = `https://cdn.dexscreener.com/token-icons/${s.tokenAddress.toLowerCase()}.png`

      return {
        address: s.tokenAddress,
        name: s.name,
        symbol: s.symbol,
        quoteSymbol,
        pairLabel,
        image,
        source: 'community' as const,
        clankerUrl: undefined,
        explorerUrl: `https://basescan.org/token/${s.tokenAddress}`,
        dexScreenerUrl: s.dexScreenerUrl,
        createdAt: s.createdAt.toISOString(),
        marketData: market,
      }
    }

    const withMarket = await runWithConcurrency(
      approved,
      fetchOne,
      DEXSCREENER_CONCURRENCY
    )

    const filtered = (withMarket as TokenWithMarket[]).filter(
      (t: TokenWithMarket) => (t.marketData?.volume24h ?? 0) > minVolume
    )

    const ts = (t: TokenWithMarket) => new Date(t.createdAt).getTime()
    const sorted = [...filtered].sort((a, b) => {
      const m1 = a.marketData
      const m2 = b.marketData
      switch (sort) {
        case 'trending':
          return (
            (m2?.priceChange6h ?? m2?.priceChange24h ?? -Infinity) -
            (m1?.priceChange6h ?? m1?.priceChange24h ?? -Infinity)
          )
        case 'new':
          return ts(b) - ts(a)
        case 'gainers':
          return (m2?.priceChange24h ?? -Infinity) - (m1?.priceChange24h ?? -Infinity)
        case 'mcap':
          return (m2?.fdv ?? 0) - (m1?.fdv ?? 0)
        case 'volume':
          return (m2?.volume24h ?? 0) - (m1?.volume24h ?? 0)
        default:
          return 0
      }
    })

    const total = sorted.length
    const totalVolume = sorted.reduce((acc: number, t: TokenWithMarket) => acc + (t.marketData?.volume24h ?? 0), 0)
    const totalTxns = sorted.reduce((acc: number, t: TokenWithMarket) => acc + (t.marketData?.txns24h ?? 0), 0)
    const page = sorted.slice(offset, offset + limit)

    return NextResponse.json({
      tokens: page,
      total,
      totalVolume,
      totalTxns,
    })
  } catch (e) {
    console.error('Tokens API error:', e)
    return NextResponse.json(
      { error: 'Failed to fetch tokens', details: String(e) },
      { status: 500 }
    )
  }
}
