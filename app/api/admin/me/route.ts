import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/config'

export async function GET(request: Request) {
  const address = new URL(request.url).searchParams.get('address')
  if (!address) {
    return NextResponse.json({ isAdmin: false })
  }
  return NextResponse.json({ isAdmin: isAdmin(address) })
}
