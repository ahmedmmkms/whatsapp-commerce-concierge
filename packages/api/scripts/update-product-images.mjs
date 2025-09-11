#!/usr/bin/env node
// Updates ProductMedia for products based on a simple JSON mapping.
// Usage:
//   node scripts/update-product-images.mjs -f ../../data/product-images.json [--dry]
// Mapping format (either):
//   { "SKU-123": ["https://.../img1.jpg", "https://.../img2.jpg"], ... }
// or
//   [ { sku: "SKU-123", urls: ["https://..."], kind: "image" }, ... ]

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function parseArgs(argv) {
  const opts = { file: null, dry: false }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '-f' || a === '--file') {
      opts.file = argv[++i]
    } else if (a === '--dry' || a === '--dry-run') {
      opts.dry = true
    }
  }
  return opts
}

function loadMapping(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const data = JSON.parse(raw)
  if (Array.isArray(data)) {
    return data.map((e) => ({ sku: e.sku, urls: e.urls || [], kind: e.kind || 'image' }))
  }
  const entries = []
  for (const [sku, urls] of Object.entries(data)) {
    entries.push({ sku, urls: Array.isArray(urls) ? urls : [String(urls)], kind: 'image' })
  }
  return entries
}

async function main() {
  const { file, dry } = parseArgs(process.argv)
  if (!file) {
    console.error('Missing -f/--file <mapping.json>')
    process.exit(2)
  }
  const resolved = path.isAbsolute(file)
    ? file
    : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../', file)
  if (!fs.existsSync(resolved)) {
    console.error('File not found:', resolved)
    process.exit(2)
  }

  const entries = loadMapping(resolved)
  console.log(`Loaded ${entries.length} SKU image mappings from ${resolved}`)

  let updated = 0, skipped = 0, missing = 0, mediaCreated = 0
  for (const entry of entries) {
    const sku = entry.sku
    if (!sku || !entry.urls || entry.urls.length === 0) { skipped++; continue }
    const product = await prisma.product.findUnique({ where: { sku } })
    if (!product) { missing++; continue }
    if (dry) {
      console.log(`[dry] Would replace ${sku} media with ${entry.urls.length} item(s)`) 
      continue
    }
    await prisma.$transaction([
      prisma.productMedia.deleteMany({ where: { productId: product.id } }),
      prisma.productMedia.createMany({
        data: entry.urls.map((url, idx) => ({
          productId: product.id,
          url,
          kind: entry.kind || 'image',
          sortOrder: idx,
        })),
        skipDuplicates: true,
      }),
    ])
    updated++
    mediaCreated += entry.urls.length
  }

  console.log(`Done. Updated ${updated} products (${mediaCreated} media). Missing: ${missing}, skipped: ${skipped}`)
}

main()
  .catch((err) => { console.error(err); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

