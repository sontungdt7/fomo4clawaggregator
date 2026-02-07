'use client'

export type SortTab = 'trending' | 'new' | 'gainers' | 'mcap' | 'volume'

const TABS: { id: SortTab; label: string; labelShort: string }[] = [
  { id: 'trending', label: 'Trending 6H', labelShort: 'Trending' },
  { id: 'new', label: 'New Pairs', labelShort: 'New' },
  { id: 'gainers', label: 'Top Gainers', labelShort: 'Gainers' },
  { id: 'mcap', label: 'MarketCap', labelShort: 'MCap' },
  { id: 'volume', label: '24h Volume', labelShort: 'Volume' },
]

interface TokenTabsProps {
  active: SortTab
  onChange: (tab: SortTab) => void
}

export function TokenTabs({ active, onChange }: TokenTabsProps) {
  return (
    <div className="flex overflow-x-auto gap-1 pb-1 -mx-1 min-w-0 sm:overflow-visible sm:flex-wrap">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`shrink-0 rounded-md px-2.5 sm:px-3 py-1.5 text-sm font-medium transition-colors ${
            active === tab.id
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          }`}
        >
          <span className="sm:hidden">{tab.labelShort}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
