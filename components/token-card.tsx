'use client'

import type { Token } from '@/lib/types'
import { ExternalLink } from 'lucide-react'

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

export function TokenCard({ token }: { token: Token }) {
  const m = token.marketData

  return (
    <article className="rounded border border-border bg-card p-4 transition-colors hover:border-primary/50">
      <div className="mb-3 flex items-center gap-3">
        {token.image ? (
          <img
            src={token.image}
            alt={token.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg">
            {token.symbol.slice(0, 2)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold">{token.name}</span>
            {token.source && (
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] capitalize">
                {token.source}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">{token.symbol}</div>
        </div>
      </div>
      {token.description && (
        <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
          {token.description}
        </p>
      )}
      {token.agent && (
        <div className="mb-3 text-[10px] text-muted-foreground">
          agent: {token.agent}
        </div>
      )}
      {m && (
        <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Price </span>
            <span className="tabular-nums">{fmtPrice(m.priceUsd)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">24h </span>
            <span
              className={
                (m.priceChange24h ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'
              }
            >
              {m.priceChange24h != null ? `${m.priceChange24h.toFixed(1)}%` : '—'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Vol </span>
            <span className="tabular-nums">{fmtNum(m.volume24h)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Liq </span>
            <span className="tabular-nums">{fmtNum(m.liquidity)}</span>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {token.clankerUrl && (
          <a
            href={token.clankerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
          >
            Clanker <ExternalLink className="h-2.5 w-2.5" />
          </a>
        )}
        <a
          href={`https://dexscreener.com/base/${token.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
        >
          DexScreener <ExternalLink className="h-2.5 w-2.5" />
        </a>
        {token.explorerUrl && (
          <a
            href={token.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
          >
            Basescan <ExternalLink className="h-2.5 w-2.5" />
          </a>
        )}
      </div>
    </article>
  )
}
