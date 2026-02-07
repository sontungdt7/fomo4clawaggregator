-- Run this in Supabase SQL Editor to create tables (first-time setup)
-- Generated from prisma/schema.postgres.prisma
-- Path: prisma/init.sql

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "pairAddress" TEXT,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "image" TEXT,
    "dexScreenerUrl" TEXT NOT NULL,
    "chainId" TEXT NOT NULL DEFAULT 'base',
    "submittedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "voterAddress" TEXT NOT NULL,
    "direction" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Submission_status_idx" ON "Submission"("status");
CREATE INDEX "Submission_submittedBy_idx" ON "Submission"("submittedBy");
CREATE INDEX "Vote_submissionId_idx" ON "Vote"("submissionId");
CREATE UNIQUE INDEX "Vote_submissionId_voterAddress_key" ON "Vote"("submissionId", "voterAddress");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
