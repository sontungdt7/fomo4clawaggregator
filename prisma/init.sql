-- Run this in Supabase SQL Editor to create tables (first-time setup)
-- Generated from prisma/schema.postgres.prisma

-- CreateTable
CREATE TABLE "Pair" (
    "id" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "pairAddress" TEXT,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "image" TEXT,
    "dexScreenerUrl" TEXT NOT NULL,
    "chainId" TEXT NOT NULL DEFAULT 'base',
    "submittedBy" TEXT NOT NULL,
    "votes" TEXT,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pair_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Pair_submittedBy_idx" ON "Pair"("submittedBy");
