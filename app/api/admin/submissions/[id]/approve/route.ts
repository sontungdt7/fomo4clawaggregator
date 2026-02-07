import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isAdmin } from '@/lib/config'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { walletAddress, action } = body as {
      walletAddress?: string
      action?: 'approve' | 'reject'
    }

    if (!walletAddress || !isAdmin(walletAddress)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'action must be approve or reject' },
        { status: 400 }
      )
    }

    const { id } = await params
    const sub = await prisma.submission.findUnique({ where: { id } })
    if (!sub) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (sub.status !== 'pending') {
      return NextResponse.json(
        { error: 'Submission already processed' },
        { status: 400 }
      )
    }

    await prisma.submission.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        approvedAt: new Date(),
        approvedBy: walletAddress.toLowerCase(),
      },
    })

    return NextResponse.json({
      status: action === 'approve' ? 'approved' : 'rejected',
    })
  } catch (e) {
    console.error('Admin approve error:', e)
    return NextResponse.json(
      { error: 'Failed to update' },
      { status: 500 }
    )
  }
}
