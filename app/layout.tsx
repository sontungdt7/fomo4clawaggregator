import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Footer } from '@/components/footer'
import { InstallPrompt } from '@/components/install-prompt'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Fomo4Claw — Community Curated Agent Coins',
  description: 'Community Curated Agent Coins.',
  icons: { icon: '/logo.png', apple: '/logo.png' },
  appleWebApp: { capable: true, title: 'Fomo4Claw' },
}

export const viewport = {
  width: 'device-width' as const,
  initialScale: 1,
  themeColor: '#09090b',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistMono.variable} font-mono`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            {children}
            <Footer />
          </div>
          <InstallPrompt />
        </Providers>
      </body>
    </html>
  )
}
