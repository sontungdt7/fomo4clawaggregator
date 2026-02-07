'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useWallet } from '@/lib/wallet-context'
import { Header } from '@/components/header'
import { Check, X, ExternalLink } from 'lucide-react'
import { TokenImage } from '@/components/token-image'

export default function AdminPage() {
  const { address, isConnected } = useWallet()
  const qc = useQueryClient()

  const { data: adminData } = useQuery({
    queryKey: ['admin', address],
    queryFn: async () => {
      const res = await fetch(`/api/admin/me?address=${address}`)
      const data = await res.json()
      return data
    },
    enabled: !!address,
  })
  const admin = isConnected && address && adminData?.isAdmin

  const { data, isLoading } = useQuery({
    queryKey: ['submissions', 'pending'],
    queryFn: async () => {
      const res = await fetch('/api/submissions?status=pending')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
    enabled: admin,
  })

  const approveMutation = useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string
      action: 'approve' | 'reject'
    }) => {
      const res = await fetch(`/api/admin/submissions/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, action }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed')
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['submissions'] })
    },
  })

  const submissions = (data?.submissions ?? []) as Array<{
    id: string
    name: string
    symbol: string
    quoteSymbol?: string
    pairLabel?: string
    image?: string
    dexScreenerUrl: string
    voteCount: number
    submittedBy: string
    createdAt: string
  }>

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container mx-auto flex-1 px-4 py-12">
          <p className="text-muted-foreground">Connect your wallet to access admin.</p>
        </main>
      </div>
    )
  }

  if (!admin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container mx-auto flex-1 px-4 py-12">
          <p className="text-rose-400">You are not an admin.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto flex-1 px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold">Admin Approvals</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Approve or reject pending submissions. Approved pairs appear on the main listing.
        </p>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg border border-border bg-card" />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <p className="text-muted-foreground">No pending submissions.</p>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4"
              >
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
                      <span className="text-sm text-emerald-400">↑ {sub.voteCount}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      by {sub.submittedBy.slice(0, 10)}... • {new Date(sub.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={sub.dexScreenerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => approveMutation.mutate({ id: sub.id, action: 'approve' })}
                    disabled={approveMutation.isPending}
                    className="flex items-center gap-1 rounded-md bg-emerald-500/20 px-3 py-1.5 text-sm font-medium text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => approveMutation.mutate({ id: sub.id, action: 'reject' })}
                    disabled={approveMutation.isPending}
                    className="flex items-center gap-1 rounded-md bg-rose-500/20 px-3 py-1.5 text-sm font-medium text-rose-400 hover:bg-rose-500/30 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
