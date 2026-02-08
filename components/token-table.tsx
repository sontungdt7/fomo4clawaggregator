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
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

function fmtAdded(createdAt?: string): string {
  if (!createdAt) return '—'
  const d = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffM = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)
  if (diffM < 60) return `${diffM}m`
  if (diffH < 24) return `${diffH}h`
  if (diffD < 365) return `${diffD}d`
  return `${Math.floor(diffD / 365)}y`
}

function PctCell({ value }: { value?: number }) {
  if (value == null) return <span className="text-muted-foreground">—</span>
  const isPos = value >= 0
  return (
    <span className={isPos ? 'text-emerald-400' : 'text-rose-400'}>
      {fmtPct(value)}
    </span>
  )
}

interface TokenTableProps {
  tokens: Token[]
  startRank?: number
  onVote?: (id: string, dir: number) => void
  voting?: boolean
}

export function TokenTable({ tokens, startRank = 1, onVote, voting }: TokenTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[700px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              #
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Token
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              Price
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              Added
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              24H
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              Liquidity
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              MCAP
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              Vote
            </th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {tokens.map((token, i) => {
            const m = token.marketData
            return (
              <tr
                key={token.address}
                className="border-b border-border/50 transition-colors hover:bg-muted/20"
              >
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {startRank + i}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <TokenImage
                      src={token.image}
                      alt={token.name}
                      symbol={token.symbol}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        {token.pairLabel && (
                          <span className="rounded border border-border px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                            {token.pairLabel}
                          </span>
                        )}
                        <span className="font-medium">
                          {token.quoteSymbol ? `${token.symbol} / ${token.quoteSymbol}` : token.symbol}
                        </span>
                        {token.source && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] capitalize text-muted-foreground">
                            {token.source}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {token.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {fmtPrice(m?.priceUsd)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {fmtAdded(token.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <PctCell value={m?.priceChange24h} />
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {fmtNum(m?.liquidity)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {fmtNum(m?.fdv)}
                </td>
                <td className="px-4 py-3">
                  {token.id && onVote && (
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onVote(token.id!, 1)}
                        disabled={voting}
                        className={`rounded p-1.5 transition-colors ${
                          token.myVote === 1 ? 'bg-emerald-500/30 text-emerald-400' : 'hover:bg-muted text-muted-foreground'
                        }`}
                        title="Upvote"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-[1.5rem] text-center text-xs tabular-nums">{token.voteCount ?? 0}</span>
                      <button
                        type="button"
                        onClick={() => onVote(token.id!, -1)}
                        disabled={voting}
                        className={`rounded p-1.5 transition-colors ${
                          token.myVote === -1 ? 'bg-rose-500/30 text-rose-400' : 'hover:bg-muted text-muted-foreground'
                        }`}
                        title="Downvote"
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <a
                      href={token.dexScreenerUrl ?? `https://dexscreener.com/base/${token.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      title="DexScreener"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    {token.clankerUrl && (
                      <a
                        href={token.clankerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="Clanker"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
