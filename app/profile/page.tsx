'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { Header } from '@/components/header'
import { Check, X, ExternalLink, Trash2, Copy, LogOut } from 'lucide-react'
import { TokenImage } from '@/components/token-image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

type SubmissionItem = {
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
}

export default function ProfilePage() {
  const { address, isConnected, disconnect } = useWallet()
  const qc = useQueryClient()
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shortAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : ''

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

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats', address],
    queryFn: async () => {
      const res = await fetch(`/api/admin/stats?address=${address}`)
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    enabled: admin,
  })

  const { data: pendingData, isLoading } = useQuery({
    queryKey: ['submissions', 'pending'],
    queryFn: async () => {
      const res = await fetch('/api/submissions?status=pending')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
    enabled: admin,
  })

  const { data: approvedData } = useQuery({
    queryKey: ['submissions', 'approved'],
    queryFn: async () => {
      const res = await fetch('/api/submissions?status=approved')
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
      action: 'approve' | 'reject' | 'remove'
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
      qc.invalidateQueries({ queryKey: ['tokens'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })

  const submissions = (pendingData?.submissions ?? []) as SubmissionItem[]
  const listed = (approvedData?.submissions ?? []) as SubmissionItem[]

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container mx-auto flex-1 px-4 py-12 min-w-0 overflow-x-hidden">
          <h1 className="mb-2 text-2xl font-bold">Profile</h1>
          <p className="mb-4 text-muted-foreground">Log in to view your profile.</p>
          <p className="text-sm text-muted-foreground">
            Use the Log in button in the header to connect.
          </p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto flex-1 px-4 py-8 min-w-0 overflow-x-hidden">
        <h1 className="mb-2 text-2xl font-bold">Profile</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Your wallet and account settings.
        </p>

        <div className="mb-12 rounded-lg border border-border bg-card p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold">Wallet</h2>
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex min-w-0 items-center gap-2 rounded-md bg-muted/50 px-3 sm:px-4 py-2 font-mono text-sm">
              <span className="min-w-0 flex-1 text-muted-foreground sm:flex-none" title={address ?? undefined}>
                <span className="sm:hidden">{shortAddress}</span>
                <span className="hidden sm:inline">{address}</span>
              </span>
              <button
                type="button"
                onClick={copyAddress}
                className="shrink-0 rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Copy address"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <button
              type="button"
              onClick={() => disconnect()}
              className="flex items-center gap-2 rounded-md bg-rose-500/20 px-4 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/30"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        </div>

        {admin && (
          <>
            <h2 className="mb-4 text-lg font-semibold">Admin</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Approve or reject pending submissions. Remove pairs from the listing.
            </p>

            {!statsLoading && stats && (
              <div className="mb-8 flex flex-wrap gap-4 rounded-lg border border-border bg-card p-4">
                <div>
                  <span className="text-2xl font-bold">{stats.totalUsers}</span>
                  <span className="ml-2 text-sm text-muted-foreground">Total Users</span>
                </div>
                <div>
                  <span className="text-2xl font-bold">{stats.totalSubmissions}</span>
                  <span className="ml-2 text-sm text-muted-foreground">Submissions</span>
                </div>
                <div>
                  <span className="text-2xl font-bold">{stats.totalApproved}</span>
                  <span className="ml-2 text-sm text-muted-foreground">Listed</span>
                </div>
                <div>
                  <span className="text-2xl font-bold">{stats.totalPending}</span>
                  <span className="ml-2 text-sm text-muted-foreground">Pending</span>
                </div>
              </div>
            )}

            <h3 className="mb-4 text-base font-medium">Pending Approval</h3>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-lg border border-border bg-card" />
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <p className="mb-8 text-muted-foreground">No pending submissions.</p>
            ) : (
              <div className="mb-12 space-y-4">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
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
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
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

            <h3 className="mb-4 text-base font-medium">Listed (Remove from listing)</h3>
            {listed.length === 0 ? (
              <p className="text-muted-foreground">No listed pairs.</p>
            ) : (
              <div className="space-y-4">
                {listed.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
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
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
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
                        onClick={() => approveMutation.mutate({ id: sub.id, action: 'remove' })}
                        disabled={approveMutation.isPending}
                        className="flex items-center gap-1 rounded-md bg-rose-500/20 px-3 py-1.5 text-sm font-medium text-rose-400 hover:bg-rose-500/30 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
