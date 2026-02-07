export const ADMIN_ADDRESSES = (
  process.env.ADMIN_ADDRESSES ?? ''
)
  .split(',')
  .map((a) => a.trim().toLowerCase())
  .filter(Boolean)

export function isAdmin(address: string): boolean {
  return ADMIN_ADDRESSES.includes(address.toLowerCase())
}
