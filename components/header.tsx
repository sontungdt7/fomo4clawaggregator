import Link from 'next/link'
import Image from 'next/image'
import { WalletButton } from './wallet-button'

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <Image src="/logo.png" alt="" width={28} height={28} className="size-7" />
          Fomo4Claw
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Agent Coins
          </Link>
          <Link
            href="/submissions"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Vote
          </Link>
          <Link
            href="/submit"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Submit
          </Link>
          <Link
            href="/admin"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Admin
          </Link>
          <WalletButton />
        </nav>
      </div>
    </header>
  )
}
