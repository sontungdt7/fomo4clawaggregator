'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useWallet } from '@/lib/wallet-context'
import { Header } from '@/components/header'
import { TokenImage } from '@/components/token-image'
import { ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react'
import { useState } from 'react'

type SubmissionItem = {
  id: string
  name: string
  symbol: string
  quoteSymbol?: string
  pairLabel?: string
  image?: string
  dexScreenerUrl: string
  voteCount: number
  status: string
  submittedBy: string
  createdAt: string
  myVote?: number
}

function SubmissionCard({
  sub,
  onVote,
  userVote,
  isConnected,
}: {
  sub: SubmissionItem
  onVote: (id: string, dir: number) => void
  userVote?: number
  isConnected: boolean
}) {
  const [voting, setVoting] = useState(false)
  const handleVote = async (dir: number) => {
    setVoting(true)
    await onVote(sub.id, dir)
    setVoting(false)
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-4">
        <TokenImage
          src={sub.image}
          alt={sub.name}
          symbol={sub.symbol}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div>
          <div className="flex items-center gap-2">
            {sub.pairLabel && (
              <span className="rounded border border-border px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                {sub.pairLabel}
              </span>
            )}
            <span className="font-semibold">
              {sub.quoteSymbol ? `${sub.symbol} / ${sub.quoteSymbol}` : sub.symbol}
            </span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs">{sub.name}</span>
            <span className="text-xs text-muted-foreground capitalize">({sub.status})</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>by {sub.submittedBy.slice(0, 8)}...</span>
            <span>•</span>
            <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleVote(1)}
            disabled={voting || !isConnected}
            className={`rounded p-2 transition-colors ${
              userVote === 1 ? 'bg-emerald-500/30 text-emerald-400' : 'hover:bg-muted text-muted-foreground'
            }`}
            title="Upvote"
          >
            <ThumbsUp className="h-4 w-4" />
          </button>
          <span className="min-w-[2rem] text-center font-medium tabular-nums">{sub.voteCount}</span>
          <button
            type="button"
            onClick={() => handleVote(-1)}
            disabled={voting || !isConnected}
            className={`rounded p-2 transition-colors ${
              userVote === -1 ? 'bg-rose-500/30 text-rose-400' : 'hover:bg-muted text-muted-foreground'
            }`}
            title="Downvote"
          >
            <ThumbsDown className="h-4 w-4" />
          </button>
        </div>
        <a
          href={sub.dexScreenerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}

export default function SubmissionsPage() {
  const { address, isConnected } = useWallet()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['submissions', address],
    queryFn: async () => {
      const params = new URLSearchParams({ status: 'pending' })
      if (address) params.set('wallet', address)
      const res = await fetch(`/api/submissions?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  const voteMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: number }) => {
      const res = await fetch(`/api/submissions/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, direction }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Vote failed')
      }
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['submissions'] }),
  })

  const submissions: SubmissionItem[] = data?.submissions ?? []
  const handleVote = (id: string, dir: number) => voteMutation.mutateAsync({ id, direction: dir })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto flex-1 px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold">Submit & Vote</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Pending submissions. Upvote pairs you want listed. Admin approves high-vote pairs.
        </p>

        {!isConnected && (
          <div className="mb-6 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm">
            Connect your wallet to vote.
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg border border-border bg-card" />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <p className="text-muted-foreground">No pending submissions. Submit one from the Submit page.</p>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <SubmissionCard
                key={sub.id}
                sub={sub}
                onVote={handleVote}
                userVote={sub.myVote}
                isConnected={!!isConnected}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
