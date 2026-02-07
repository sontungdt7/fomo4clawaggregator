'use client'

function fmtVolume(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

interface StatsBarProps {
  totalTokens: number
  volume24h: number
  txns24h: number
}

export function StatsBar({ totalTokens, volume24h, txns24h }: StatsBarProps) {
  return (
    <section className="flex flex-wrap items-center gap-6 border-b border-border py-3 text-sm">
      <div>
        <span className="text-muted-foreground">24H Volume: </span>
        <span className="font-medium tabular-nums">{fmtVolume(volume24h)}</span>
      </div>
      <div>
        <span className="text-muted-foreground">24H Txns: </span>
        <span className="font-medium tabular-nums">{txns24h.toLocaleString()}</span>
      </div>
      <div>
        <span className="text-muted-foreground">Pairs: </span>
        <span className="font-medium tabular-nums">{totalTokens}</span>
      </div>
    </section>
  )
}
