import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getOrCreateVisitorId } from '@/lib/visitor-id'

function parseVotes(votesJson: string | null): Record<string, number> {
  if (!votesJson) return {}
  try {
    const o = JSON.parse(votesJson) as Record<string, number>
    return typeof o === 'object' && o !== null ? o : {}
  } catch {
    return {}
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { walletAddress, direction } = body as {
      walletAddress?: string
      direction?: number
    }

    let voter: string
    if (walletAddress && typeof walletAddress === 'string') {
      voter = walletAddress.toLowerCase()
    } else {
      voter = await getOrCreateVisitorId()
    }

    if (direction !== 1 && direction !== -1) {
      return NextResponse.json(
        { error: 'direction must be 1 (upvote) or -1 (downvote)' },
        { status: 400 }
      )
    }

    const pair = await prisma.pair.findUnique({
      where: { id },
    })
    if (!pair) {
      return NextResponse.json({ error: 'Pair not found' }, { status: 404 })
    }

    const votes = parseVotes(pair.votes)
    votes[voter] = direction
    const voteCount = Object.values(votes).reduce((a, b) => a + b, 0)

    await prisma.pair.update({
      where: { id },
      data: {
        votes: JSON.stringify(votes),
        voteCount,
      },
    })

    return NextResponse.json({
      voteCount,
      message: direction === 1 ? 'Upvoted' : 'Downvoted',
    })
  } catch (e) {
    console.error('Vote POST error:', e)
    return NextResponse.json(
      { error: 'Failed to vote' },
      { status: 500 }
    )
  }
}
