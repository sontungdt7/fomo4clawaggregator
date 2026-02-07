'use client'

import { Header } from '@/components/header'
import { TokenList } from '@/components/token-list'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto flex-1 px-4 py-6">
        <TokenList />
      </main>
    </div>
  )
}
