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
"[project]/app/api/tokens/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dexscreener$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/dexscreener.ts [app-route] (ecmascript)");
;
;
;
const MIN_VOLUME = 1;
const MAX_TOKENS_TO_FETCH = 50 // limit DexScreener calls
;
const DEXSCREENER_CONCURRENCY = 10;
const CACHE_TTL_MS = 5 * 60 * 1000;
const marketCache = new Map();
const pairInfoCache = new Map();
function getCached(address) {
    const e = marketCache.get(address.toLowerCase());
    if (!e || Date.now() > e.expires) return undefined;
    return e.data;
}
function setCached(address, data) {
    marketCache.set(address.toLowerCase(), {
        data,
        expires: Date.now() + CACHE_TTL_MS
    });
}
async function runWithConcurrency(items, fn, concurrency) {
    const results = [];
    for(let i = 0; i < items.length; i += concurrency){
        const chunk = items.slice(i, i + concurrency);
        const chunkResults = await Promise.all(chunk.map(fn));
        results.push(...chunkResults);
    }
    return results;
}
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const minVolume = parseFloat(searchParams.get('minVolume') ?? '1') || 1;
        const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10) || 20, 100);
        const offset = Math.max(parseInt(searchParams.get('offset') ?? '0', 10) || 0, 0);
        const sort = searchParams.get('sort') ?? 'trending';
        const approved = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].submission.findMany({
            where: {
                status: 'approved'
            },
            include: {
                votes: true
            },
            orderBy: {
                approvedAt: 'desc'
            },
            take: MAX_TOKENS_TO_FETCH
        });
        // Fast path: no tokens → return immediately (no DexScreener calls)
        if (approved.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                tokens: [],
                total: 0,
                totalVolume: 0,
                totalTxns: 0
            });
        }
        const fetchOne = async (s)=>{
            let market = getCached(s.tokenAddress);
            if (!market) {
                market = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dexscreener$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchTokenPairs"])(s.tokenAddress) ?? undefined;
                if (market) setCached(s.tokenAddress, market);
            }
            // Fetch full pair info (image, quoteSymbol, labels) from DexScreener URL
            let image = s.image;
            let quoteSymbol;
            let pairLabel;
            if (s.dexScreenerUrl) {
                const cached = pairInfoCache.get(s.dexScreenerUrl);
                if (cached && Date.now() < cached.expires) {
                    image = cached.data.image ?? image;
                    quoteSymbol = cached.data.quoteSymbol;
                    pairLabel = cached.data.labels?.[0];
                } else {
                    const pairInfo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dexscreener$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchPairFromUrl"])(s.dexScreenerUrl);
                    if (pairInfo) {
                        if (pairInfo.image?.includes('/cms/images')) image = pairInfo.image;
                        quoteSymbol = pairInfo.quoteSymbol;
                        pairLabel = pairInfo.labels?.[0];
                        pairInfoCache.set(s.dexScreenerUrl, {
                            data: {
                                image: image ?? undefined,
                                quoteSymbol,
                                labels: pairInfo.labels
                            },
                            expires: Date.now() + CACHE_TTL_MS
                        });
                    }
                }
            }
            if (!image) image = `https://cdn.dexscreener.com/token-icons/${s.tokenAddress.toLowerCase()}.png`;
            return {
                address: s.tokenAddress,
                name: s.name,
                symbol: s.symbol,
                quoteSymbol,
                pairLabel,
                image,
                source: 'community',
                clankerUrl: undefined,
                explorerUrl: `https://basescan.org/token/${s.tokenAddress}`,
                dexScreenerUrl: s.dexScreenerUrl,
                createdAt: s.createdAt.toISOString(),
                marketData: market
            };
        };
        const withMarket = await runWithConcurrency(approved, fetchOne, DEXSCREENER_CONCURRENCY);
        const filtered = withMarket.filter((t)=>(t.marketData?.volume24h ?? 0) > minVolume);
        const ts = (t)=>new Date(t.createdAt).getTime();
        const sorted = [
            ...filtered
        ].sort((a, b)=>{
            const m1 = a.marketData;
            const m2 = b.marketData;
            switch(sort){
                case 'trending':
                    return (m2?.priceChange6h ?? m2?.priceChange24h ?? -Infinity) - (m1?.priceChange6h ?? m1?.priceChange24h ?? -Infinity);
                case 'new':
                    return ts(b) - ts(a);
                case 'gainers':
                    return (m2?.priceChange24h ?? -Infinity) - (m1?.priceChange24h ?? -Infinity);
                case 'mcap':
                    return (m2?.fdv ?? 0) - (m1?.fdv ?? 0);
                case 'volume':
                    return (m2?.volume24h ?? 0) - (m1?.volume24h ?? 0);
                default:
                    return 0;
            }
        });
        const total = sorted.length;
        const totalVolume = sorted.reduce((acc, t)=>acc + (t.marketData?.volume24h ?? 0), 0);
        const totalTxns = sorted.reduce((acc, t)=>acc + (t.marketData?.txns24h ?? 0), 0);
        const page = sorted.slice(offset, offset + limit);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            tokens: page,
            total,
            totalVolume,
            totalTxns
        });
    } catch (e) {
        console.error('Tokens API error:', e);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch tokens',
            details: String(e)
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c5d07ab6._.js.map