export type TokenSource = 'bankr' | 'clawnch' | 'other' | 'moltx' | 'moltbook' | '4claw' | 'clawstr' | 'community'

export interface Token {
  address: string
  name: string
  symbol: string
  quoteSymbol?: string
  pairLabel?: string
  description?: string
  image?: string
  agent?: string
  source?: TokenSource
  postUrl?: string
  clankerUrl?: string
  dexScreenerUrl?: string
  explorerUrl?: string
  txHash?: string
  createdAt?: string
  marketData?: {
    priceUsd?: string
    priceChange5m?: number
    priceChange1h?: number
    priceChange6h?: number
    priceChange24h?: number
    volume24h?: number
    liquidity?: number
    fdv?: number
    txns24h?: number
  }
  id?: string
  voteCount?: number
  myVote?: number
}
