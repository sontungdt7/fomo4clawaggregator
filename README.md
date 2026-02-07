# Fomo4Claw

Community-curated token pairs on Base. Users submit DexScreener pairs, vote on them, and admins approve for listing.

## Architecture

- **Next.js app** – Submit page, voting, admin approval, main listing
- **Prisma + PostgreSQL** – Submissions and votes
- **Wallet connect** – wagmi/viem for Base
- **DexScreener API** – Market data for listed tokens

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Add to `.env` or `.env.local` (required):
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   - `DATABASE_URL` – PostgreSQL connection string (e.g. Neon, Supabase, or local Postgres)
   - `ADMIN_ADDRESSES` – Comma-separated wallet addresses for admin access

3. Initialize database:
   ```bash
   npm run db:push
   ```

## Run

```bash
npm run dev
```

If you have `PONDER_API_URL` in `.env` from an older setup, you can remove it.

## Deploy to Vercel

1. **Create a PostgreSQL database** – Vercel Postgres (recommended) or Neon/Supabase.
2. **Connect the repo** to Vercel and add env vars:
   - `DATABASE_URL` – your Postgres connection URL (Vercel Postgres sets this automatically)
   - `ADMIN_ADDRESSES` – comma-separated admin wallet addresses
3. **Deploy** – Build runs `prisma generate`, `prisma db push`, then `next build`.

For local dev with Postgres, use [Neon](https://neon.tech) or [Supabase](https://supabase.com) free tiers.

## Flow

1. **Submit** – User pastes DexScreener URL, submits for voting
2. **Vote** – Other users upvote/downvote submissions
3. **Admin** – Admin approves high-vote pairs
4. **Listed** – Approved tokens appear on main page with DexScreener market data
