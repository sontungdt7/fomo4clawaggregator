'use client'

import Link from 'next/link'
import Image from 'next/image'

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight shrink-0">
          <Image src="/logo.png" alt="" width={28} height={28} className="size-7" />
          <span className="hidden sm:inline">Fomo4Claw</span>
          <span className="sm:hidden">F4C</span>
        </Link>
      </div>
    </header>
  )
}
