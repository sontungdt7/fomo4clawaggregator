import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { fetchPairFromUrl } from '@/lib/dexscreener'

const PAIR_INFO_CACHE_TTL = 5 * 60 * 1000
const pairInfoCache = new Map<string, { image?: string; quoteSymbol?: string; labels?: string[]; expires: number }>()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // pending | approved | rejected
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10) || 50, 100)
    const offset = Math.max(parseInt(searchParams.get('offset') ?? '0', 10) || 0, 0)

    const wallet = searchParams.get('wallet')?.toLowerCase()
    const where = status ? { status } : {}
    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        include: {
          votes: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.submission.count({ where }),
    ])

    const voteSums = await prisma.vote.groupBy({
      by: ['submissionId'],
      _sum: { direction: true },
      where: { submissionId: { in: submissions.map((s: { id: string }) => s.id) } },
    })
    const voteBySub = Object.fromEntries(
      voteSums.map((v: { submissionId: string; _sum: { direction: number | null } }) => [v.submissionId, v._sum.direction ?? 0])
    )

    let myVotes: Record<string, number> = {}
    if (wallet) {
      const userVotes = await prisma.vote.findMany({
        where: {
          submissionId: { in: submissions.map((s: { id: string }) => s.id) },
          voterAddress: wallet,
        },
      })
      myVotes = Object.fromEntries(userVotes.map((v: { submissionId: string; direction: number }) => [v.submissionId, v.direction]))
    }

    const getPairInfo = async (s: (typeof submissions)[number]) => {
      let img = s.image
      let quoteSymbol: string | undefined
      let labels: string[] | undefined
      if (s.dexScreenerUrl) {
        const cached = pairInfoCache.get(s.dexScreenerUrl)
        if (cached && Date.now() < cached.expires) {
          img = cached.image ?? img
          quoteSymbol = cached.quoteSymbol
          labels = cached.labels
        } else {
          const pairInfo = await fetchPairFromUrl(s.dexScreenerUrl)
          if (pairInfo) {
            if (pairInfo.image?.includes('/cms/images')) img = pairInfo.image
            quoteSymbol = pairInfo.quoteSymbol
            labels = pairInfo.labels
            pairInfoCache.set(s.dexScreenerUrl, {
              image: img ?? undefined,
              quoteSymbol,
              labels,
              expires: Date.now() + PAIR_INFO_CACHE_TTL,
            })
          }
        }
      }
      return {
        image: img ?? `https://cdn.dexscreener.com/token-icons/${s.tokenAddress.toLowerCase()}.png`,
        quoteSymbol,
        pairLabel: labels?.[0],
      }
    }

    const pairInfos = await Promise.all(submissions.map(getPairInfo))
    const items = submissions.map((s: (typeof submissions)[number], i: number) => ({
      id: s.id,
      tokenAddress: s.tokenAddress,
      pairAddress: s.pairAddress,
      name: s.name,
      symbol: s.symbol,
      quoteSymbol: pairInfos[i].quoteSymbol,
      pairLabel: pairInfos[i].pairLabel,
      image: pairInfos[i].image,
      dexScreenerUrl: s.dexScreenerUrl,
      chainId: s.chainId,
      submittedBy: s.submittedBy,
      status: s.status,
      voteCount: voteBySub[s.id] ?? 0,
      myVote: wallet ? myVotes[s.id] : undefined,
      createdAt: s.createdAt.toISOString(),
      approvedAt: s.approvedAt?.toISOString(),
    }))

    return NextResponse.json({ submissions: items, total })
  } catch (e) {
    console.error('Submissions GET error:', e)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { dexScreenerUrl, walletAddress } = body as {
      dexScreenerUrl?: string
      walletAddress?: string
    }

    if (!dexScreenerUrl || typeof dexScreenerUrl !== 'string') {
      return NextResponse.json(
        { error: 'dexScreenerUrl is required' },
        { status: 400 }
      )
    }
    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json(
        { error: 'walletAddress is required (connect wallet)' },
        { status: 400 }
      )
    }

    const pairInfo = await fetchPairFromUrl(dexScreenerUrl.trim())
    if (!pairInfo) {
      return NextResponse.json(
        { error: 'Invalid DexScreener URL or pair not found' },
        { status: 400 }
      )
    }

    const existing = await prisma.submission.findFirst({
      where: {
        tokenAddress: pairInfo.tokenAddress.toLowerCase(),
        status: { in: ['pending', 'approved'] },
      },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'This pair is already submitted or approved' },
        { status: 409 }
      )
    }

    const sub = await prisma.submission.create({
      data: {
        tokenAddress: pairInfo.tokenAddress.toLowerCase(),
        pairAddress: pairInfo.pairAddress,
        name: pairInfo.name,
        symbol: pairInfo.symbol,
        image: pairInfo.image,
        dexScreenerUrl: dexScreenerUrl.trim(),
        chainId: pairInfo.chainId,
        submittedBy: walletAddress.toLowerCase(),
        status: 'pending',
      },
    })

    return NextResponse.json({
      id: sub.id,
      message: 'Submission created. Others can vote. Admin will approve.',
    })
  } catch (e) {
    console.error('Submissions POST error:', e)
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    )
  }
}
