'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { Header } from '@/components/header'
import { Check, Copy, LogOut } from 'lucide-react'

export default function ProfilePage() {
  const { address, isConnected, disconnect } = useWallet()
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
      </main>
    </div>
  )
}
