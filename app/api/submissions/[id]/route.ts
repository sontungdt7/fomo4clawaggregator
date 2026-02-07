import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sub = await prisma.submission.findUnique({
      where: { id },
      include: { votes: true },
    })
    if (!sub) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const voteSum = sub.votes.reduce((a: number, v: { direction: number }) => a + v.direction, 0)
    return NextResponse.json({
      ...sub,
      voteCount: voteSum,
    })
  } catch (e) {
    console.error('Submission GET error:', e)
    return NextResponse.json(
      { error: 'Failed to fetch' },
      { status: 500 }
    )
  }
}
