import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { fetchPairFromUrl } from '@/lib/dexscreener'
import { getOrCreateVisitorId } from '@/lib/visitor-id'

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

    let submittedBy: string
    if (walletAddress && typeof walletAddress === 'string') {
      submittedBy = walletAddress.toLowerCase()
    } else {
      submittedBy = await getOrCreateVisitorId()
    }

    const pairInfo = await fetchPairFromUrl(dexScreenerUrl.trim())
    if (!pairInfo) {
      return NextResponse.json(
        { error: 'Invalid DexScreener URL or pair not found' },
        { status: 400 }
      )
    }

    const existing = await prisma.pair.findFirst({
      where: {
        tokenAddress: pairInfo.tokenAddress.toLowerCase(),
      },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'This pair is already listed' },
        { status: 409 }
      )
    }

    const pair = await prisma.pair.create({
      data: {
        tokenAddress: pairInfo.tokenAddress.toLowerCase(),
        pairAddress: pairInfo.pairAddress,
        name: pairInfo.name,
        symbol: pairInfo.symbol,
        image: pairInfo.image,
        dexScreenerUrl: dexScreenerUrl.trim(),
        chainId: pairInfo.chainId,
        submittedBy,
      },
    })

    return NextResponse.json({
      id: pair.id,
      message: 'Pair added. Others can upvote or downvote.',
    })
  } catch (e) {
    console.error('Submissions POST error:', e)
    return NextResponse.json(
      { error: 'Failed to add pair' },
      { status: 500 }
    )
  }
}
