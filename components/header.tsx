'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight shrink-0">
          <Image src="/logo.png" alt="" width={28} height={28} className="size-7" />
          <span className="hidden sm:inline">Fomo4Claw</span>
          <span className="sm:hidden">F4C</span>
        </Link>
        <a
          href="https://t.me/+MwIJa6YfiyxhZDA1"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>Telegram</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </header>
  )
}
