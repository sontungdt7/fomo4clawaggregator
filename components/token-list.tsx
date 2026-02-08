'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useWallet } from '@/lib/wallet-context'
import type { Token } from '@/lib/types'
import { TokenTable } from './token-table'
import { TokenRowMobile } from './token-row-mobile'
import { StatsBar } from './stats-bar'
import type { SortKey, SortOrder } from './token-table'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 10
const MIN_VOLUME_USD = 1
const REFRESH_INTERVAL_MS = 15_000

export function TokenList() {
  const { address, isConnected } = useWallet()
  const qc = useQueryClient()
  const [sortTab, setSortTab] = useState<SortKey>('votes')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [page, setPage] = useState(1)
  const offset = (page - 1) * PAGE_SIZE

  const { data, error, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['tokens', MIN_VOLUME_USD, PAGE_SIZE, offset, sortTab, sortOrder, address],
    staleTime: REFRESH_INTERVAL_MS,
    refetchInterval: REFRESH_INTERVAL_MS,
    queryFn: async () => {
      await fetch('/api/visitor-id')
      const params = new URLSearchParams({
        minVolume: String(MIN_VOLUME_USD),
        limit: String(PAGE_SIZE),
        offset: String(offset),
        sort: sortTab,
        order: sortOrder,
      })
      if (isConnected && address) params.set('wallet', address)
      const res = await fetch(`/api/tokens?${params}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? `HTTP ${res.status}`)
      }
      return res.json()
    },
  })

  const voteMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: number }) => {
      const res = await fetch(`/api/submissions/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: isConnected && address ? address : undefined,
          direction,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Vote failed')
      }
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tokens'] }),
  })

  const tokens: Token[] = Array.isArray(data?.tokens) ? data.tokens : []
  const total = typeof data?.total === 'number' ? data.total : 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const handleVote = (id: string, dir: number) => voteMutation.mutateAsync({ id, direction: dir })

  const handleSortChange = (sort: SortKey, order: SortOrder) => {
    setSortTab(sort)
    setSortOrder(order)
  }

  const [countdown, setCountdown] = useState(0)
  useEffect(() => {
    if (!dataUpdatedAt) return
    const update = () => {
      const ms = dataUpdatedAt + REFRESH_INTERVAL_MS - Date.now()
      setCountdown(Math.max(0, Math.ceil(ms / 1000)))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [dataUpdatedAt])

  useEffect(() => {
    setPage(1)
  }, [sortTab, sortOrder])
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages))
  }, [totalPages])

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (error || (tokens.length === 0 && total === 0)) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        {error ? (
          `Failed to load tokens: ${String(error)}`
        ) : (
          <span>
            No pairs yet.{' '}
            <Link
              href="/submit"
              className="inline-flex items-center rounded-md border border-primary bg-primary/20 px-3 py-1.5 font-medium text-primary hover:bg-primary/30"
            >
              Add one
            </Link>
          </span>
        )}
      </div>
    )
  }

  return (
    <section>
      <StatsBar totalTokens={total} countdownSeconds={countdown} />
      <div className="mb-4 md:mb-0">
      <div className="md:hidden space-y-2">
        {tokens.map((token, i) => (
          <TokenRowMobile
            key={token.address}
            token={token}
            rank={offset + i + 1}
            onVote={handleVote}
            voting={voteMutation.isPending}
          />
        ))}
      </div>
      <div className="hidden md:block">
        <TokenTable
          tokens={tokens}
          startRank={offset + 1}
          onVote={handleVote}
          voting={voteMutation.isPending}
          sort={sortTab}
          order={sortOrder}
          onSortChange={handleSortChange}
        />
      </div>
      </div>
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
