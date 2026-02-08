import { cookies } from 'next/headers'

const COOKIE_NAME = 'visitor_id'
const MAX_AGE = 365 * 24 * 60 * 60 // 1 year

function createVisitorId(): string {
  return `anon:${crypto.randomUUID()}`
}

/**
 * Get or create visitor ID from cookie. Creates cookie if not present.
 * Returns the voter/submitter address: "anon:uuid".
 */
export async function getOrCreateVisitorId(): Promise<string> {
  const cookieStore = await cookies()
  let id = cookieStore.get(COOKIE_NAME)?.value

  if (!id || !id.startsWith('anon:')) {
    id = createVisitorId()
    cookieStore.set(COOKIE_NAME, id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: MAX_AGE,
      path: '/',
    })
  }

  return id
}

/**
 * Get visitor ID if present (read-only). Does not create.
 */
export async function getVisitorIdIfPresent(): Promise<string | null> {
  const cookieStore = await cookies()
  const id = cookieStore.get(COOKIE_NAME)?.value
  return id?.startsWith('anon:') ? id : null
}
