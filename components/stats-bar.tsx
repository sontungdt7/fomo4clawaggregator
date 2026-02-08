'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'

interface StatsBarProps {
  totalTokens: number
  countdownSeconds?: number
}

export function StatsBar({ totalTokens, countdownSeconds }: StatsBarProps) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-4 sm:gap-6 border-b border-border py-3 text-sm">
      <div className="tabular-nums flex items-center gap-2">
        <span>
          <span className="text-muted-foreground">Pairs: </span>
          <span className="font-medium">{totalTokens}</span>
        </span>
        <Link
          href="/submit"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
          Add Pair
        </Link>
      </div>
      {countdownSeconds != null && (
        <span className="text-muted-foreground text-xs">
          Update: {countdownSeconds}s
        </span>
      )}
    </section>
  )
}
