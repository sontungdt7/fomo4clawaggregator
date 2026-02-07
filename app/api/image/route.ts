import { NextResponse } from 'next/server'

const ALLOWED_HOSTS = ['cdn.dexscreener.com']

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    if (!url) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 })
    }

    let decoded: string
    try {
      decoded = decodeURIComponent(url)
    } catch {
      return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
    }

    const parsed = new URL(decoded)
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
      return NextResponse.json({ error: 'Host not allowed' }, { status: 400 })
    }

    // token-icons return 422 from DexScreener - return 404 so img onError fires and TokenImage shows initials
    if (decoded.includes('/token-icons/')) {
      return new NextResponse(null, { status: 404 })
    }

    const res = await fetch(decoded, {
      headers: {
        Referer: 'https://dexscreener.com/',
        'User-Agent': 'Mozilla/5.0 (compatible; Fomo4Claw/1.0)',
      },
      cache: 'force-cache',
      next: { revalidate: 86400 },
    })

    if (!res.ok) {
      return new NextResponse(null, { status: 404 })
    }

    const contentType = res.headers.get('content-type') ?? 'image/png'
    const body = await res.arrayBuffer()

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    })
  } catch (e) {
    console.error('Image proxy error:', e)
    return NextResponse.json({ error: 'Proxy failed' }, { status: 500 })
  }
}
