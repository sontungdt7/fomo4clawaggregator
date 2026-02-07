# Fomo4Claw

Community-curated token pairs on Base. Users submit DexScreener pairs, vote on them, and admins approve for listing.

## Architecture

- **Next.js app** – Submit page, voting, admin approval, main listing
- **Prisma + SQLite or PostgreSQL** – Submissions and votes (SQLite for local/Render; Postgres for Vercel)
- **Wallet connect** – wagmi/viem for Base
- **DexScreener API** – Market data for listed tokens

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Add to `.env` or `.env.local` (required):
   - `DATABASE_URL` – PostgreSQL connection string
   - `ADMIN_ADDRESSES` – Comma-separated wallet addresses for admin access

3. **Local development** – Use SQLite (default when `DATABASE_URL` starts with `file:`):
   ```
   DATABASE_URL="file:./dev.db"
   ADMIN_ADDRESSES="0xYourWallet"
   ```
   Or use Docker Postgres: `docker compose up -d` then
   `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fomo4claw"`

4. Initialize database:
   ```bash
   npm run db:push
   ```

## Run

```bash
npm run dev
```

If you have `PONDER_API_URL` in `.env` from an older setup, you can remove it.

## Deploy to Vercel

1. **Create a PostgreSQL database** – Vercel Postgres (recommended), Neon, or Supabase.
2. **Connect the repo** to Vercel and add env vars:
   - `DATABASE_URL` – **must be a PostgreSQL connection string** (starts with `postgresql://` or `postgres://`)
   - `ADMIN_ADDRESSES` – comma-separated admin wallet addresses

3. **Supabase users**: `DATABASE_URL` must be the **Database** connection string, NOT the REST API URL.
   - Go to Supabase Dashboard → Project Settings → Database
   - Under "Connection string" → "URI", copy the string (replace `[YOUR-PASSWORD]` with your DB password)
   - Format: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`
   - The `https://xxx.supabase.co` URL is for the REST API and will **not** work with Prisma.

4. **Deploy** – Build runs `prisma generate` then `next build`. **Before first deploy**, create tables either:
   - Run `npx prisma db push` locally with `DATABASE_URL` set to your production DB URL, or
   - In Supabase SQL Editor, run the SQL in `prisma/init.sql`

## Deploy to Render (SQLite – simpler, no external DB)

1. **Create a Web Service** at [dashboard.render.com](https://dashboard.render.com)
2. **Connect your GitHub repo**
3. **Add a Persistent Disk** (required for SQLite):
   - In the service → Disks → Add Disk
   - Mount path: `/data`
   - Size: 1 GB
4. **Environment variables**:
   - `DATABASE_URL` = `file:/data/prod.db`
   - `ADMIN_ADDRESSES` = your wallet addresses
5. **Build command**: `npm install && npm run build`
6. **Start command**: `npm run render:start`

The start command creates `/data` if needed, selects the SQLite schema, runs `prisma db push` to create tables, then starts the app. No Supabase or Postgres needed. **Note:** Persistent disks require a paid Render plan (Starter $7/mo).

## Flow

1. **Submit** – User pastes DexScreener URL, submits for voting
2. **Vote** – Other users upvote/downvote submissions
3. **Admin** – Admin approves high-vote pairs
4. **Listed** – Approved tokens appear on main page with DexScreener market data
