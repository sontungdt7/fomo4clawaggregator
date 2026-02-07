'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { WalletButton } from './wallet-button'

const navLinks = [
  { href: '/', label: 'Agent Coins' },
  { href: '/submissions', label: 'Vote' },
  { href: '/submit', label: 'Submit' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="border-b border-border">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight shrink-0">
          <Image src="/logo.png" alt="" width={28} height={28} className="size-7" />
          <span className="hidden sm:inline">Fomo4Claw</span>
          <span className="sm:hidden">F4C</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-4 md:gap-6">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <WalletButton />
        </nav>
        <div className="flex sm:hidden items-center gap-2">
          <WalletButton />
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="sm:hidden border-t border-border bg-card">
          <div className="container mx-auto flex flex-col px-4 py-3 gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
