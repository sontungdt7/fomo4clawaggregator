'use client'

import { useWallet } from '@/lib/wallet-context'
import { useState } from 'react'

export function WalletButton() {
  const { address, isConnected, connect, disconnect, isConnecting } = useWallet()
  const [showDropdown, setShowDropdown] = useState(false)

  if (isConnected && address) {
    const short = `${address.slice(0, 6)}...${address.slice(-4)}`
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm font-medium hover:bg-muted"
        >
          {short}
        </button>
        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
              aria-hidden
            />
            <div className="absolute right-0 top-full z-20 mt-1 min-w-[160px] rounded-md border border-border bg-card py-1 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  disconnect()
                  setShowDropdown(false)
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-muted"
              >
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => connect()}
      disabled={isConnecting}
      className="rounded-md border border-primary bg-primary/20 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/30 disabled:opacity-50"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}
