'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { useWallet } from '@/lib/wallet-context'
import { Header } from '@/components/header'

export default function SubmitPage() {
  const qc = useQueryClient()
  const { address, isConnected } = useWallet()
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dexScreenerUrl: url.trim(),
          walletAddress: isConnected && address ? address : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setMessage(data.error ?? `HTTP ${res.status}`)
        return
      }
        setStatus('success')
      setMessage(data.message ?? 'Pair added.')
      setUrl('')
      qc.invalidateQueries({ queryKey: ['tokens'] })
    } catch (err) {
      setStatus('error')
      setMessage(String(err))
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto flex-1 px-4 py-12 min-w-0 overflow-x-hidden">
        <div className="mx-auto max-w-xl">
          <h1 className="mb-2 text-2xl font-bold">Add a Pair</h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Paste a DexScreener URL to add a pair.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="url"
                placeholder="https://dexscreener.com/base/0x..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading' || !url.trim()}
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {status === 'loading' ? 'Submitting...' : 'Submit'}
              </button>
            </form>

          {message && (
            <div
              className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                status === 'error'
                  ? 'border-rose-500/50 bg-rose-500/10 text-rose-400'
                  : 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
              }`}
            >
              <div className="flex flex-col gap-3">
                <span>{message}</span>
                {status === 'success' && (
                  <Link
                    href="/"
                    className="inline-flex w-fit rounded-md border border-primary bg-primary/20 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/30"
                  >
                    View Agent Coins
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
