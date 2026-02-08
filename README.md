# Fomo4Claw

Community-curated token pairs on Base. Users add DexScreener pairs and upvote/downvote directly. No admin approval.

## Architecture

- **Next.js app** – Main page with pairs and vote buttons, Submit page
- **Prisma + SQLite or PostgreSQL** – Single Pair table with inline votes (SQLite for local/Render; Postgres for Vercel)
- **Wallet connect** – wagmi/viem for Base (optional; cookie-based anonymous for add/vote)
- **DexScreener API** – Market data for listed tokens

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Add to `.env` or `.env.local` (required):
   - `DATABASE_URL` – PostgreSQL connection string (or SQLite for local)

3. **Local development** – Use SQLite (default when `DATABASE_URL` starts with `file:`):
   ```
   DATABASE_URL="file:./dev.db"
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
5. **Build command**: `npm install && npm run build`
6. **Start command**: `npm run render:start`

The start command creates `/data` if needed, selects the SQLite schema, runs `prisma db push` to create tables, then starts the app. No Supabase or Postgres needed. **Note:** Persistent disks require a paid Render plan (Starter $7/mo).

## Flow

1. **Add Pair** – User pastes DexScreener URL; pair goes live immediately
2. **Vote** – Anyone can upvote or downvote pairs on the main page
3. **Listed** – Pairs appear sorted by votes, trending, market cap, etc.
