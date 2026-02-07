module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    log: ("TURBOPACK compile-time truthy", 1) ? [
        'query',
        'error',
        'warn'
    ] : "TURBOPACK unreachable"
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/lib/dexscreener.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchPairFromUrl",
    ()=>fetchPairFromUrl,
    "fetchTokenPairs",
    ()=>fetchTokenPairs,
    "parseDexScreenerUrl",
    ()=>parseDexScreenerUrl
]);
const DEXSCREENER_BASE = 'https://api.dexscreener.com';
const DEXSCREENER_FETCH_OPTS = {
    next: {
        revalidate: 300
    }
};
async function fetchTokenPairs(address) {
    try {
        const res = await fetch(`${DEXSCREENER_BASE}/latest/dex/tokens/${address}`, DEXSCREENER_FETCH_OPTS);
        if (!res.ok) return null;
        const data = await res.json();
        const pairs = data?.pairs ?? [];
        const basePair = pairs.find((p)=>p.chainId === 'base') ?? pairs[0];
        if (!basePair) return null;
        const buys = basePair.txns?.h24?.buys ?? 0;
        const sells = basePair.txns?.h24?.sells ?? 0;
        const txns24h = buys + sells || undefined;
        return {
            priceUsd: basePair.priceUsd,
            priceChange5m: basePair.priceChange?.h5,
            priceChange1h: basePair.priceChange?.h1,
            priceChange6h: basePair.priceChange?.h6,
            priceChange24h: basePair.priceChange?.h24 ?? basePair.priceChange24h,
            volume24h: basePair.volume?.h24 ?? basePair.volume24h,
            liquidity: basePair.liquidity?.usd,
            fdv: basePair.fdv,
            txns24h
        };
    } catch  {
        return null;
    }
}
function parseDexScreenerUrl(url) {
    try {
        // Token: 0x + 40 hex chars. Pair (Uniswap V4 etc): 0x + 64 hex chars
        const match = url.match(/dexscreener\.com\/([^/]+)\/(0x[a-fA-F0-9]{40,64})/);
        if (!match) return null;
        const address = match[2];
        const isPair = address.length === 66 // 0x + 64 hex = pair address
        ;
        return {
            chainId: match[1].toLowerCase(),
            address,
            isPair
        };
    } catch  {
        return null;
    }
}
async function fetchPairFromUrl(url) {
    const parsed = parseDexScreenerUrl(url);
    if (!parsed) return null;
    const { chainId, address, isPair } = parsed;
    let basePair = null;
    if (isPair) {
        // Pair URL: use /pairs/{chainId}/{pairAddress} endpoint
        const res = await fetch(`https://api.dexscreener.com/latest/dex/pairs/${chainId}/${address}`, {
            cache: 'no-store'
        });
        if (!res.ok) return null;
        const data = await res.json();
        // Pairs endpoint returns { pairs: [...] } (array, often 1 item)
        const pairs = data?.pairs ?? (Array.isArray(data) ? data : [
            data
        ]);
        basePair = pairs.find((p)=>p.chainId === chainId) ?? pairs[0] ?? null;
    } else {
        // Token URL: use /tokens/{address} endpoint
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`, {
            cache: 'no-store'
        });
        if (!res.ok) return null;
        const data = await res.json();
        const pairs = data?.pairs ?? [];
        basePair = pairs.find((p)=>p.chainId === chainId) ?? pairs[0] ?? null;
    }
    if (!basePair) return null;
    const tokenAddress = basePair.baseToken?.address ?? address;
    // Pair pages: use info.imageUrl (shows both tokens). Token pages: fallback to token icon CDN
    const image = basePair.info?.imageUrl ?? (tokenAddress ? `https://cdn.dexscreener.com/token-icons/${tokenAddress.toLowerCase()}.png` : undefined);
    return {
        tokenAddress,
        pairAddress: basePair.pairAddress,
        name: basePair.baseToken?.name ?? 'Unknown',
        symbol: basePair.baseToken?.symbol ?? '???',
        quoteSymbol: basePair.quoteToken?.symbol,
        quoteAddress: basePair.quoteToken?.address,
        labels: basePair.labels,
        dexId: basePair.dexId,
        image,
        chainId: basePair.chainId ?? chainId,
        priceUsd: basePair.priceUsd,
        volume24h: basePair.volume?.h24 ?? basePair.volume24h
    };
}
}),
"[project]/app/api/submissions/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dexscreener$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/dexscreener.ts [app-route] (ecmascript)");
;
;
;
const PAIR_INFO_CACHE_TTL = 5 * 60 * 1000;
const pairInfoCache = new Map();
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') // pending | approved | rejected
        ;
        const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10) || 50, 100);
        const offset = Math.max(parseInt(searchParams.get('offset') ?? '0', 10) || 0, 0);
        const wallet = searchParams.get('wallet')?.toLowerCase();
        const where = status ? {
            status
        } : {};
        const [submissions, total] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].submission.findMany({
                where,
                include: {
                    votes: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit,
                skip: offset
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].submission.count({
                where
            })
        ]);
        const voteSums = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].vote.groupBy({
            by: [
                'submissionId'
            ],
            _sum: {
                direction: true
            },
            where: {
                submissionId: {
                    in: submissions.map((s)=>s.id)
                }
            }
        });
        const voteBySub = Object.fromEntries(voteSums.map((v)=>[
                v.submissionId,
                v._sum.direction ?? 0
            ]));
        let myVotes = {};
        if (wallet) {
            const userVotes = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].vote.findMany({
                where: {
                    submissionId: {
                        in: submissions.map((s)=>s.id)
                    },
                    voterAddress: wallet
                }
            });
            myVotes = Object.fromEntries(userVotes.map((v)=>[
                    v.submissionId,
                    v.direction
                ]));
        }
        const getPairInfo = async (s)=>{
            let img = s.image;
            let quoteSymbol;
            let labels;
            if (s.dexScreenerUrl) {
                const cached = pairInfoCache.get(s.dexScreenerUrl);
                if (cached && Date.now() < cached.expires) {
                    img = cached.image ?? img;
                    quoteSymbol = cached.quoteSymbol;
                    labels = cached.labels;
                } else {
                    const pairInfo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dexscreener$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchPairFromUrl"])(s.dexScreenerUrl);
                    if (pairInfo) {
                        if (pairInfo.image?.includes('/cms/images')) img = pairInfo.image;
                        quoteSymbol = pairInfo.quoteSymbol;
                        labels = pairInfo.labels;
                        pairInfoCache.set(s.dexScreenerUrl, {
                            image: img ?? undefined,
                            quoteSymbol,
                            labels,
                            expires: Date.now() + PAIR_INFO_CACHE_TTL
                        });
                    }
                }
            }
            return {
                image: img ?? `https://cdn.dexscreener.com/token-icons/${s.tokenAddress.toLowerCase()}.png`,
                quoteSymbol,
                pairLabel: labels?.[0]
            };
        };
        const pairInfos = await Promise.all(submissions.map(getPairInfo));
        const items = submissions.map((s, i)=>({
                id: s.id,
                tokenAddress: s.tokenAddress,
                pairAddress: s.pairAddress,
                name: s.name,
                symbol: s.symbol,
                quoteSymbol: pairInfos[i].quoteSymbol,
                pairLabel: pairInfos[i].pairLabel,
                image: pairInfos[i].image,
                dexScreenerUrl: s.dexScreenerUrl,
                chainId: s.chainId,
                submittedBy: s.submittedBy,
                status: s.status,
                voteCount: voteBySub[s.id] ?? 0,
                myVote: wallet ? myVotes[s.id] : undefined,
                createdAt: s.createdAt.toISOString(),
                approvedAt: s.approvedAt?.toISOString()
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            submissions: items,
            total
        });
    } catch (e) {
        console.error('Submissions GET error:', e);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch submissions'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const { dexScreenerUrl, walletAddress } = body;
        if (!dexScreenerUrl || typeof dexScreenerUrl !== 'string') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'dexScreenerUrl is required'
            }, {
                status: 400
            });
        }
        if (!walletAddress || typeof walletAddress !== 'string') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'walletAddress is required (connect wallet)'
            }, {
                status: 400
            });
        }
        const pairInfo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dexscreener$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchPairFromUrl"])(dexScreenerUrl.trim());
        if (!pairInfo) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid DexScreener URL or pair not found'
            }, {
                status: 400
            });
        }
        const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].submission.findFirst({
            where: {
                tokenAddress: pairInfo.tokenAddress.toLowerCase(),
                status: {
                    in: [
                        'pending',
                        'approved'
                    ]
                }
            }
        });
        if (existing) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'This pair is already submitted or approved'
            }, {
                status: 409
            });
        }
        const sub = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].submission.create({
            data: {
                tokenAddress: pairInfo.tokenAddress.toLowerCase(),
                pairAddress: pairInfo.pairAddress,
                name: pairInfo.name,
                symbol: pairInfo.symbol,
                image: pairInfo.image,
                dexScreenerUrl: dexScreenerUrl.trim(),
                chainId: pairInfo.chainId,
                submittedBy: walletAddress.toLowerCase(),
                status: 'pending'
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            id: sub.id,
            message: 'Submission created. Others can vote. Admin will approve.'
        });
    } catch (e) {
        console.error('Submissions POST error:', e);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to create submission'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__50e66ce2._.js.map