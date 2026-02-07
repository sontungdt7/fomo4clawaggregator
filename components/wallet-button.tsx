'use client'

import Link from 'next/link'
import { useWallet } from '@/lib/wallet-context'

export function WalletButton() {
  const { isConnected, connect, isConnecting } = useWallet()

  if (isConnected) {
    return (
      <Link
        href="/profile"
        className="rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm font-medium hover:bg-muted"
      >
        Profile
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={() => connect()}
      disabled={isConnecting}
      className="rounded-md border border-primary bg-primary/20 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/30 disabled:opacity-50"
    >
      {isConnecting ? 'Connecting...' : 'Login'}
    </button>
  )
}
