'use client'

import type { Token } from '@/lib/types'
import { ExternalLink, ThumbsUp, ThumbsDown } from 'lucide-react'
import { TokenImage } from './token-image'

function fmtNum(n?: number): string {
  if (n == null) return '—'
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`
  return `$${n.toFixed(2)}`
}

function fmtPrice(s?: string): string {
  if (!s) return '—'
  const n = parseFloat(s)
  if (n < 1e-6) return `$${n.toExponential(2)}`
  if (n < 0.01) return `$${n.toFixed(6)}`
  return `$${n.toFixed(4)}`
}

function fmtPct(n?: number): string {
  if (n == null) return '—'
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`
}

interface TokenRowMobileProps {
  token: Token
  rank: number
  onVote?: (id: string, dir: number) => void
  voting?: boolean
}

export function TokenRowMobile({ token, rank, onVote, voting }: TokenRowMobileProps) {
  const m = token.marketData
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <span className="w-6 shrink-0 text-center text-sm tabular-nums text-muted-foreground">{rank}</span>
      <a
        href={token.dexScreenerUrl ?? `https://dexscreener.com/base/${token.address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-w-0 flex-1 items-center gap-3 transition-colors active:opacity-80"
      >
        <TokenImage
          src={token.image}
          alt={token.name}
          symbol={token.symbol}
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {token.pairLabel && (
              <span className="shrink-0 rounded border border-border px-1 py-0.5 text-[10px] uppercase text-muted-foreground">
                {token.pairLabel}
              </span>
            )}
            <span className="font-medium truncate">
              {token.quoteSymbol ? `${token.symbol}/${token.quoteSymbol}` : token.symbol}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="tabular-nums">{fmtPrice(m?.priceUsd)}</span>
            <span className={m && (m.priceChange24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {fmtPct(m?.priceChange24h)}
            </span>
            <span className="tabular-nums">{fmtNum(m?.fdv)}</span>
          </div>
        </div>
      </a>
      {token.id && onVote && (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onVote(token.id!, 1)}
            disabled={voting}
            className={`rounded p-2 transition-colors ${
              token.myVote === 1 ? 'bg-emerald-500/30 text-emerald-400' : 'hover:bg-muted text-muted-foreground'
            }`}
            title="Upvote"
          >
            <ThumbsUp className="h-4 w-4" />
          </button>
          <span className="min-w-[2rem] text-center text-sm font-medium tabular-nums">{token.voteCount ?? 0}</span>
          <button
            type="button"
            onClick={() => onVote(token.id!, -1)}
            disabled={voting}
            className={`rounded p-2 transition-colors ${
              token.myVote === -1 ? 'bg-rose-500/30 text-rose-400' : 'hover:bg-muted text-muted-foreground'
            }`}
            title="Downvote"
          >
            <ThumbsDown className="h-4 w-4" />
          </button>
        </div>
      )}
      <a
        href={token.dexScreenerUrl ?? `https://dexscreener.com/base/${token.address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded p-2 text-muted-foreground hover:bg-muted"
      >
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  )
}
