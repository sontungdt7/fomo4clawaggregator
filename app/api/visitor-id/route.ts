import { NextResponse } from 'next/server'
import { getOrCreateVisitorId } from '@/lib/visitor-id'

/**
 * Ensures visitor cookie is set. Call on pages that need anonymous submit/vote.
 * Cookie is set in response; subsequent requests will include it.
 */
export async function GET() {
  const id = await getOrCreateVisitorId()
  return NextResponse.json({ visitorId: id })
}
