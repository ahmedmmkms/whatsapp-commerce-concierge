#!/usr/bin/env node
// Build an image mapping (SKU -> URLs[]) by querying Unsplash for each product.
// Usage:
//   UNSPLASH_ACCESS_KEY=xxxx node scripts/fetch-unsplash-images.mjs [-o ../../data/product-images.json] [--limit 50]
// Notes:
// - Respects Unsplash API limits. Defaults to 1 result per product.
// - Query heuristic: "<name> product on white" plus category/brand when available.
// - Writes JSON mapping file suitable for update-product-images.mjs.

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function parseArgs(argv) {
  const opts = { out: '../../data/product-images.json', limit: 100 }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '-o' || a === '--out') opts.out = argv[++i]
    else if (a === '--limit') opts.limit = Number(argv[++i])
  }
  return opts
}

async function searchUnsplash(query, accessKey) {
  const url = new URL('https://api.unsplash.com/search/photos')
  url.searchParams.set('query', query)
  url.searchParams.set('per_page', '1')
  url.searchParams.set('orientation', 'landscape')
  url.searchParams.set('client_id', accessKey)
  const res = await fetch(url, { headers: { 'Accept-Version': 'v1' } })
  if (!res.ok) throw new Error(`Unsplash HTTP ${res.status}`)
  const json = await res.json()
  const first = json.results?.[0]
  if (!first) return undefined
  const u = first.urls?.regular || first.urls?.small || first.urls?.full
  return u
}

function buildQuery(p) {
  const parts = [p.name]
  if (p.brand) parts.push(p.brand)
  if (p.category?.name) parts.push(p.category.name)
  parts.push('product on white')
  return parts.filter(Boolean).join(' ')
}

async function main() {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) {
    console.error('Missing UNSPLASH_ACCESS_KEY in environment')
    process.exit(2)
  }
  const { out, limit } = parseArgs(process.argv)
  const outPath = path.isAbsolute(out)
    ? out
    : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../', out)

  const products = await prisma.product.findMany({
    take: Math.max(1, Math.min(1000, Number(limit) || 100)),
    orderBy: { createdAt: 'asc' },
    include: { category: true },
  })
  const mapping = {}
  let found = 0
  for (const p of products) {
    const q = buildQuery(p)
    try {
      const url = await searchUnsplash(q, accessKey)
      if (url) {
        mapping[p.sku] = [url]
        found++
        console.log(`✔ ${p.sku} <- ${q} -> ${url}`)
      } else {
        console.log(`∅ ${p.sku} <- ${q}`)
      }
    } catch (e) {
      console.warn(`! ${p.sku} (${q}) -> ${e.message}`)
    }
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(mapping, null, 2), 'utf8')
  console.log(`Wrote ${found} mappings to ${outPath}`)
}

main()
  .catch((err) => { console.error(err); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

