'use client'

export type SortTab = 'trending' | 'new' | 'gainers' | 'mcap' | 'volume'

const TABS: { id: SortTab; label: string }[] = [
  { id: 'trending', label: 'Trending 6H' },
  { id: 'new', label: 'New Pairs' },
  { id: 'gainers', label: 'Top Gainers' },
  { id: 'mcap', label: 'MarketCap' },
  { id: 'volume', label: '24h Volume' },
]

interface TokenTabsProps {
  active: SortTab
  onChange: (tab: SortTab) => void
}

export function TokenTabs({ active, onChange }: TokenTabsProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            active === tab.id
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
