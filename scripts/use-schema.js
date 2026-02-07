#!/usr/bin/env node
/**
 * Selects schema.prisma based on DATABASE_URL.
 * - file:... -> SQLite (local dev)
 * - postgresql:// or postgres:// -> PostgreSQL (Vercel)
 */
const fs = require('fs')
const path = require('path')

// Use process.env.DATABASE_URL first (Vercel injects this). Fall back to .env for local dev.
if (!process.env.DATABASE_URL) {
  const envPath = path.join(__dirname, '..', '.env')
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^DATABASE_URL=(.+)$/)
      if (m) {
        process.env.DATABASE_URL = m[1].trim().replace(/^["']|["']$/g, '')
        break
      }
    }
  }
}

const dbUrl = process.env.DATABASE_URL || ''
const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')
const schemaDir = path.join(__dirname, '..', 'prisma')
const source = path.join(schemaDir, isPostgres ? 'schema.postgres.prisma' : 'schema.sqlite.prisma')
const target = path.join(schemaDir, 'schema.prisma')

fs.copyFileSync(source, target)
console.log(`Using ${isPostgres ? 'PostgreSQL' : 'SQLite'} schema`)
