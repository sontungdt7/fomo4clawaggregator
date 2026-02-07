'use client'

import { useState } from 'react'

interface TokenImageProps {
  src?: string | null
  alt: string
  symbol: string
  className?: string
}

/** Proxy DexScreener CMS images. Never proxy token-icons (they return 422). */
function proxiedSrc(src: string): string {
  if (src.includes('cdn.dexscreener.com/token-icons/')) return src
  if (src.includes('cdn.dexscreener.com/cms/images')) {
    return `/api/image?url=${encodeURIComponent(src)}`
  }
  return src
}

/**
 * Token icon with fallback to initials when image fails or is missing
 */
export function TokenImage({ src, alt, symbol, className = 'h-8 w-8 rounded-full object-cover' }: TokenImageProps) {
  const [errored, setErrored] = useState(false)
  const showImage = src && !errored

  if (showImage) {
    return (
      <img
        src={proxiedSrc(src)}
        alt={alt}
        className={className}
        onError={() => setErrored(true)}
      />
    )
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-muted text-xs font-medium ${className}`}
    >
      {symbol.slice(0, 2)}
    </div>
  )
}
