import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isAdmin } from '@/lib/config'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')?.toLowerCase()
    if (!address || !isAdmin(address)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const [submitters, voters, totalSubmissions, totalApproved, totalPending] =
      await Promise.all([
        prisma.submission.findMany({ select: { submittedBy: true } }),
        prisma.vote.findMany({ select: { voterAddress: true } }),
        prisma.submission.count(),
        prisma.submission.count({ where: { status: 'approved' } }),
        prisma.submission.count({ where: { status: 'pending' } }),
      ])

    const allAddresses = new Set<string>()
    submitters.forEach((r) => {
      if (r.submittedBy !== 'anonymous') allAddresses.add(r.submittedBy)
    })
    voters.forEach((r) => allAddresses.add(r.voterAddress))

    return NextResponse.json({
      totalUsers: allAddresses.size,
      totalSubmitters: new Set(submitters.map((r) => r.submittedBy).filter((a) => a !== 'anonymous')).size,
      totalVoters: new Set(voters.map((r) => r.voterAddress)).size,
      totalSubmissions,
      totalApproved,
      totalPending,
    })
  } catch (e) {
    console.error('Admin stats error:', e)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
