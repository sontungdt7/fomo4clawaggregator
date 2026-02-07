import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json(
        { error: 'walletAddress is required (connect wallet)' },
        { status: 400 }
      )
    }
    if (direction !== 1 && direction !== -1) {
      return NextResponse.json(
        { error: 'direction must be 1 (upvote) or -1 (downvote)' },
        { status: 400 }
      )
    }

    const submission = await prisma.submission.findUnique({
      where: { id },
    })
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    const voter = walletAddress.toLowerCase()

    await prisma.vote.upsert({
      where: {
        submissionId_voterAddress: { submissionId: id, voterAddress: voter },
      },
      create: {
        submissionId: id,
        voterAddress: voter,
        direction,
      },
      update: { direction },
    })

    const sum = await prisma.vote.aggregate({
      where: { submissionId: id },
      _sum: { direction: true },
    })

    return NextResponse.json({
      voteCount: sum._sum.direction ?? 0,
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
