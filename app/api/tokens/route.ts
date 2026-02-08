import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { fetchTokenPairs, fetchPairFromUrl } from '@/lib/dexscreener'
import { getOrCreateVisitorId, getVisitorIdIfPresent } from '@/lib/visitor-id'

type TokenWithMarket = {
  id: string
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
  voteCount: number
  myVote?: number
  marketData: Awaited<ReturnType<typeof fetchTokenPairs>> | undefined
}

type PairInfo = {
  image?: string
  quoteSymbol?: string
  labels?: string[]
}

const MIN_VOLUME = 1
const PAGE_SIZE = 10
const DEXSCREENER_CONCURRENCY = 10
const MARKET_CACHE_TTL_MS = 15 * 1000 // 15s - only 10 pairs per page, can refresh faster
const PAIR_INFO_CACHE_TTL_MS = 5 * 60 * 1000
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

function parseVotes(votesJson: string | null): Record<string, number> {
  if (!votesJson) return {}
  try {
    const o = JSON.parse(votesJson) as Record<string, number>
    return typeof o === 'object' && o !== null ? o : {}
  } catch {
    return {}
  }
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
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10', 10) || 10, 50)
    const offset = Math.max(parseInt(searchParams.get('offset') ?? '0', 10) || 0, 0)
    const sort = (searchParams.get('sort') ?? 'votes') as 'votes' | 'new' | 'mcap' | 'price' | '24h'
    const order = (searchParams.get('order') ?? 'desc') as 'asc' | 'desc'
    const walletParam = searchParams.get('wallet')?.toLowerCase()
    const voterAddress = walletParam ?? (await getVisitorIdIfPresent()) ?? (await getOrCreateVisitorId())

    const prismaOrder = (dir: 'asc' | 'desc') =>
      sort === 'votes'
        ? ([{ voteCount: dir }, { createdAt: 'desc' }] as const)
        : ([{ createdAt: dir }] as const)

    const [total, pairs] = await Promise.all([
      prisma.pair.count(),
      prisma.pair.findMany({
        orderBy: sort === 'votes' || sort === 'new' ? prismaOrder(order) : [{ voteCount: 'desc' }, { createdAt: 'desc' }],
        skip: offset,
        take: limit,
      }),
    ])

    if (pairs.length === 0) {
      return NextResponse.json({
        tokens: [],
        total,
        totalVolume: 0,
        totalTxns: 0,
      })
    }

    const fetchOne = async (p: { id: string; tokenAddress: string; name: string; symbol: string; image: string | null; dexScreenerUrl: string; createdAt: Date; voteCount: number; votes: string | null }) => {
      let market = getCached(p.tokenAddress)
      if (!market) {
        market = await fetchTokenPairs(p.tokenAddress) ?? undefined
        if (market) setCached(p.tokenAddress, market)
      }

      let image = p.image
      let quoteSymbol: string | undefined
      let pairLabel: string | undefined
      if (p.dexScreenerUrl) {
        const cached = pairInfoCache.get(p.dexScreenerUrl)
        if (cached && Date.now() < cached.expires) {
          image = cached.data.image ?? image
          quoteSymbol = cached.data.quoteSymbol
          pairLabel = cached.data.labels?.[0]
        } else {
          const pairInfo = await fetchPairFromUrl(p.dexScreenerUrl)
          if (pairInfo) {
            if (pairInfo.image?.includes('/cms/images')) image = pairInfo.image
            quoteSymbol = pairInfo.quoteSymbol
            pairLabel = pairInfo.labels?.[0]
            pairInfoCache.set(p.dexScreenerUrl, {
              data: { image: image ?? undefined, quoteSymbol, labels: pairInfo.labels },
              expires: Date.now() + PAIR_INFO_CACHE_TTL_MS,
            })
          }
        }
      }
      if (!image) image = `https://cdn.dexscreener.com/token-icons/${p.tokenAddress.toLowerCase()}.png`

      const votes = parseVotes(p.votes)
      const myVote = voterAddress ? votes[voterAddress] : undefined

      return {
        id: p.id,
        address: p.tokenAddress,
        name: p.name,
        symbol: p.symbol,
        quoteSymbol,
        pairLabel,
        image,
        source: 'community' as const,
        clankerUrl: undefined,
        explorerUrl: `https://basescan.org/token/${p.tokenAddress}`,
        dexScreenerUrl: p.dexScreenerUrl,
        createdAt: p.createdAt.toISOString(),
        voteCount: p.voteCount,
        myVote,
        marketData: market,
      }
    }

    const withMarket = await runWithConcurrency(pairs, fetchOne, DEXSCREENER_CONCURRENCY)

    let result = (withMarket as TokenWithMarket[]).filter(
      (t: TokenWithMarket) => (t.marketData?.volume24h ?? 0) > minVolume
    )

    if (sort === 'mcap' || sort === 'price' || sort === '24h') {
      result = [...result].sort((a, b) => {
        let diff = 0
        if (sort === 'mcap') {
          diff = (a.marketData?.fdv ?? 0) - (b.marketData?.fdv ?? 0)
        } else if (sort === 'price') {
          const pa = parseFloat(a.marketData?.priceUsd ?? '0') || 0
          const pb = parseFloat(b.marketData?.priceUsd ?? '0') || 0
          diff = pa - pb
        } else {
          diff = (a.marketData?.priceChange24h ?? 0) - (b.marketData?.priceChange24h ?? 0)
        }
        return order === 'desc' ? -diff : diff
      })
    }

    const totalVolume = result.reduce((acc: number, t: TokenWithMarket) => acc + (t.marketData?.volume24h ?? 0), 0)
    const totalTxns = result.reduce((acc: number, t: TokenWithMarket) => acc + (t.marketData?.txns24h ?? 0), 0)

    return NextResponse.json({
      tokens: result,
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
