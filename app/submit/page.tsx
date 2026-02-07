'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { Header } from '@/components/header'

export default function SubmitPage() {
  const { address, isConnected } = useWallet()
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim() || !isConnected || !address) return
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dexScreenerUrl: url.trim(),
          walletAddress: address ?? undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setMessage(data.error ?? `HTTP ${res.status}`)
        return
      }
      setStatus('success')
      setMessage(data.message ?? 'Submitted!')
      setUrl('')
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
          <h1 className="mb-2 text-2xl font-bold">Submit a Pair</h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Paste a DexScreener URL to submit a pair for community voting. High upvotes can get listed.
          </p>

          {!isConnected ? (
            <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm">
              Log in to submit a pair.
            </div>
          ) : (
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
                {status === 'loading' ? 'Submitting...' : 'Submit for Voting'}
              </button>
            </form>
          )}

          {message && (
            <div
              className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                status === 'error'
                  ? 'border-rose-500/50 bg-rose-500/10 text-rose-400'
                  : 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
