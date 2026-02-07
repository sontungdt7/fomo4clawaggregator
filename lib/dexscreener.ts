const DEXSCREENER_BASE = 'https://api.dexscreener.com'

interface DexPair {
  chainId?: string
  pairAddress?: string
  dexId?: string
  labels?: string[]
  baseToken?: { address?: string; name?: string; symbol?: string }
  quoteToken?: { address?: string; name?: string; symbol?: string }
  priceUsd?: string
  priceChange?: { h5?: number; h1?: number; h6?: number; h24?: number }
  priceChange24h?: number
  volume?: { h24?: number }
  volume24h?: number
  liquidity?: { usd?: number }
  fdv?: number
  txns?: { h24?: { buys?: number; sells?: number } }
  info?: { imageUrl?: string }
}

interface DexResponse {
  pairs?: DexPair[] | null
}

const DEXSCREENER_FETCH_OPTS: RequestInit = {
  next: { revalidate: 60 } as const, // 1 min cache
}

export async function fetchTokenPairs(
  address: string
): Promise<{
  priceUsd?: string
  priceChange5m?: number
  priceChange1h?: number
  priceChange6h?: number
  priceChange24h?: number
  volume24h?: number
  liquidity?: number
  fdv?: number
  txns24h?: number
} | null> {
  try {
    const res = await fetch(`${DEXSCREENER_BASE}/latest/dex/tokens/${address}`, DEXSCREENER_FETCH_OPTS)
    if (!res.ok) return null

    const data: DexResponse = await res.json()
    const pairs = data?.pairs ?? []

    const basePair = pairs.find((p) => p.chainId === 'base') ?? pairs[0]
    if (!basePair) return null

    const buys = basePair.txns?.h24?.buys ?? 0
    const sells = basePair.txns?.h24?.sells ?? 0
    const txns24h = buys + sells || undefined

    return {
      priceUsd: basePair.priceUsd,
      priceChange5m: basePair.priceChange?.h5,
      priceChange1h: basePair.priceChange?.h1,
      priceChange6h: basePair.priceChange?.h6,
      priceChange24h: basePair.priceChange?.h24 ?? basePair.priceChange24h,
      volume24h: basePair.volume?.h24 ?? basePair.volume24h,
      liquidity: basePair.liquidity?.usd,
      fdv: basePair.fdv,
      txns24h,
    }
  } catch {
    return null
  }
}

/**
 * Parse DexScreener URL e.g. https://dexscreener.com/base/0x123
 * Supports both token (40 hex) and pair/pool (64 hex) addresses
 * Returns { chainId, address, isPair } or null
 */
export function parseDexScreenerUrl(url: string): { chainId: string; address: string; isPair: boolean } | null {
  try {
    // Token: 0x + 40 hex chars. Pair (Uniswap V4 etc): 0x + 64 hex chars
    const match = url.match(/dexscreener\.com\/([^/]+)\/(0x[a-fA-F0-9]{40,64})/)
    if (!match) return null
    const address = match[2]
    const isPair = address.length === 66 // 0x + 64 hex = pair address
    return { chainId: match[1].toLowerCase(), address, isPair }
  } catch {
    return null
  }
}

/**
 * Fetch token/pair info from DexScreener URL for submission
 * Supports both token URLs (dexscreener.com/base/0xTOKEN) and pair URLs (dexscreener.com/base/0xPAIR...)
 * Uniswap V3 pool addresses are 40 hex chars (same as tokens), so we try pairs endpoint first.
 */
export async function fetchPairFromUrl(
  url: string
): Promise<{
  tokenAddress: string
  pairAddress?: string
  name: string
  symbol: string
  quoteSymbol?: string
  quoteAddress?: string
  labels?: string[]
  dexId?: string
  image?: string
  chainId: string
  priceUsd?: string
  volume24h?: number
} | null> {
  const parsed = parseDexScreenerUrl(url)
  if (!parsed) return null

  const { chainId, address, isPair } = parsed

  let basePair: DexPair | null = null

  // For 64-char addresses (Uniswap V4 etc): pairs only. For 40-char addresses (tokens, Uniswap V2/V3 pools): try pairs first (Uniswap V3), then tokens.
  if (isPair) {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/pairs/${chainId}/${address}`,
      { cache: 'no-store' }
    )
    if (!res.ok) return null
    const data = await res.json()
    const pairs = data?.pairs ?? (Array.isArray(data) ? data : [data])
    basePair = pairs.find((p: DexPair) => p.chainId === chainId) ?? pairs[0] ?? null
  } else {
    // 40-char address: could be token OR Uniswap V3 pool. Try pairs first.
    const pairsRes = await fetch(
      `https://api.dexscreener.com/latest/dex/pairs/${chainId}/${address}`,
      { cache: 'no-store' }
    )
    if (pairsRes.ok) {
      const data = await pairsRes.json()
      const pairs = data?.pairs ?? (Array.isArray(data) ? data : [data])
      basePair = pairs.find((p: DexPair) => p.chainId === chainId) ?? pairs[0] ?? null
    }
    if (!basePair) {
      const tokensRes = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${address}`,
        { cache: 'no-store' }
      )
      if (!tokensRes.ok) return null
      const data = await tokensRes.json()
      const pairs = data?.pairs ?? []
      basePair = pairs.find((p: DexPair) => p.chainId === chainId) ?? pairs[0] ?? null
    }
  }

  if (!basePair) return null

  const tokenAddress = basePair.baseToken?.address ?? address
  // Pair pages: use info.imageUrl (shows both tokens). Token pages: fallback to token icon CDN
  const image =
    basePair.info?.imageUrl ??
    (tokenAddress ? `https://cdn.dexscreener.com/token-icons/${tokenAddress.toLowerCase()}.png` : undefined)

  return {
    tokenAddress,
    pairAddress: basePair.pairAddress,
    name: basePair.baseToken?.name ?? 'Unknown',
    symbol: basePair.baseToken?.symbol ?? '???',
    quoteSymbol: basePair.quoteToken?.symbol,
    quoteAddress: basePair.quoteToken?.address,
    labels: basePair.labels,
    dexId: basePair.dexId,
    image,
    chainId: basePair.chainId ?? chainId,
    priceUsd: basePair.priceUsd,
    volume24h: basePair.volume?.h24 ?? basePair.volume24h,
  }
}
