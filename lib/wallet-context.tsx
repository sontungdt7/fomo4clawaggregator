'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    }
  }
}

type WalletContextValue = {
  address: string | null
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  isConnecting: boolean
}

const WalletContext = createContext<WalletContextValue | null>(null)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const connect = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) return
    setIsConnecting(true)
    try {
      const accounts = (await window.ethereum!.request({
        method: 'eth_requestAccounts',
      })) as string[]
      if (accounts[0]) setAddress(accounts[0])
    } catch {
      // User rejected
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => setAddress(null), [])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return
    window.ethereum
      .request({ method: 'eth_accounts' })
      .then((accounts) => {
        const a = accounts as string[]
        if (a[0]) setAddress(a[0])
      })
      .catch(() => {})
  }, [])

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        connect,
        disconnect,
        isConnecting,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}
