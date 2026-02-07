'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Token } from '@/lib/types'
import { TokenTable } from './token-table'
import { TokenTabs, type SortTab } from './token-tabs'
import { StatsBar } from './stats-bar'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 20
const MIN_VOLUME_USD = 1

export function TokenList() {
  const [sortTab, setSortTab] = useState<SortTab>('trending')
  const [page, setPage] = useState(1)
  const offset = (page - 1) * PAGE_SIZE

  const { data, error } = useQuery({
    queryKey: ['tokens', MIN_VOLUME_USD, PAGE_SIZE, offset, sortTab],
    staleTime: 60_000, // 1 min - avoid refetch on rapid tab/sort changes
    // Show "No tokens yet" immediately while fetching, instead of loading skeleton
    placeholderData: { tokens: [], total: 0, totalVolume: 0, totalTxns: 0 },
    queryFn: async () => {
      const params = new URLSearchParams({
        minVolume: String(MIN_VOLUME_USD),
        limit: String(PAGE_SIZE),
        offset: String(offset),
        sort: sortTab,
      })
      const res = await fetch(`/api/tokens?${params}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? `HTTP ${res.status}`)
      }
      return res.json()
    },
  })

  const tokens: Token[] = Array.isArray(data?.tokens) ? data.tokens : []
  const total = typeof data?.total === 'number' ? data.total : 0
  const totalVolume = typeof data?.totalVolume === 'number' ? data.totalVolume : 0
  const totalTxns = typeof data?.totalTxns === 'number' ? data.totalTxns : 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => {
    setPage(1)
  }, [sortTab])
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages))
  }, [totalPages])

  if (error || (tokens.length === 0 && total === 0)) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        {error ? `Failed to load tokens: ${String(error)}` : 'No tokens yet.'}
      </div>
    )
  }

  return (
    <section>
      <StatsBar
        totalTokens={total}
        volume24h={totalVolume}
        txns24h={totalTxns}
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rank by:</span>
          <TokenTabs active={sortTab} onChange={setSortTab} />
        </div>
        <button
          type="button"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Filters
        </button>
      </div>
      <TokenTable tokens={tokens} startRank={offset + 1} />
      {total > PAGE_SIZE && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            Pairs {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <span className="px-3 py-1.5 text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
