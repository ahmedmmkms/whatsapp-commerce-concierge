// Seed script: Electronics & Devices catalog (idempotent)
// Usage:
//   DATABASE_URL=postgres://... pnpm -C packages/api run db:seed:electronics
// or
//   cd packages/api && node scripts/seed-electronics.mjs

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  { slug: 'electronics', name: 'Electronics' },
  { slug: 'smartphones', name: 'Smartphones', parentSlug: 'electronics' },
  { slug: 'laptops', name: 'Laptops', parentSlug: 'electronics' },
  { slug: 'tablets', name: 'Tablets', parentSlug: 'electronics' },
  { slug: 'audio', name: 'Audio', parentSlug: 'electronics' },
  { slug: 'headphones', name: 'Headphones', parentSlug: 'audio' },
  { slug: 'speakers', name: 'Speakers', parentSlug: 'audio' },
  { slug: 'smart-home', name: 'Smart Home', parentSlug: 'electronics' },
  { slug: 'lighting', name: 'Lighting', parentSlug: 'smart-home' },
  { slug: 'security', name: 'Security', parentSlug: 'smart-home' },
  { slug: 'gaming', name: 'Gaming', parentSlug: 'electronics' },
  { slug: 'consoles', name: 'Consoles', parentSlug: 'gaming' },
  { slug: 'gaming-accessories', name: 'Accessories', parentSlug: 'gaming' },
]

const products = [
  { sku: 'PHN-APL-15PRO-128', name: 'iPhone 15 Pro 128GB', description: 'Apple A17 Pro, 6.1" OLED', price: 99900, currency: 'USD', stock: 25, brand: 'Apple', categorySlug: 'smartphones', media: ['https://picsum.photos/id/1011/800/600'] },
  { sku: 'PHN-SMS-S24-256', name: 'Samsung Galaxy S24 256GB', description: 'Dynamic AMOLED 2X, 120Hz', price: 89900, currency: 'USD', stock: 30, brand: 'Samsung', categorySlug: 'smartphones', media: ['https://picsum.photos/id/1012/800/600'] },
  { sku: 'PHN-GGL-PX8-128', name: 'Google Pixel 8 128GB', description: 'Tensor G3, 6.2" Actua', price: 69900, currency: 'USD', stock: 40, brand: 'Google', categorySlug: 'smartphones', media: ['https://picsum.photos/id/1013/800/600'] },
  { sku: 'LPT-APL-MBA13-M3', name: 'MacBook Air 13" M3 256GB', description: 'Apple M3, 8GB RAM', price: 129900, currency: 'USD', stock: 15, brand: 'Apple', categorySlug: 'laptops', media: ['https://picsum.photos/id/1027/800/600'] },
  { sku: 'LPT-DEL-XPS13', name: 'Dell XPS 13', description: 'Intel Core i7, 16GB, 512GB', price: 119900, currency: 'USD', stock: 12, brand: 'Dell', categorySlug: 'laptops', media: ['https://picsum.photos/id/1025/800/600'] },
  { sku: 'LPT-LNV-X1C', name: 'Lenovo ThinkPad X1 Carbon', description: 'Intel Core i7, 16GB, 1TB', price: 139900, currency: 'USD', stock: 10, brand: 'Lenovo', categorySlug: 'laptops', media: ['https://picsum.photos/id/1024/800/600'] },
  { sku: 'TBL-APL-IPAD-AIR', name: 'iPad Air 10.9"', description: 'M2 chip, 128GB', price: 59900, currency: 'USD', stock: 35, brand: 'Apple', categorySlug: 'tablets', media: ['https://picsum.photos/id/1035/800/600'] },
  { sku: 'TBL-SMS-TAB-S9', name: 'Samsung Galaxy Tab S9', description: 'AMOLED, S Pen', price: 79900, currency: 'USD', stock: 20, brand: 'Samsung', categorySlug: 'tablets', media: ['https://picsum.photos/id/1033/800/600'] },
  { sku: 'AUD-SONY-WH1000XM5', name: 'Sony WH-1000XM5', description: 'ANC over-ear headphones', price: 39900, currency: 'USD', stock: 50, brand: 'Sony', categorySlug: 'headphones', media: ['https://picsum.photos/id/1050/800/600'] },
  { sku: 'AUD-APL-AIRP-PRO2', name: 'AirPods Pro (2nd gen)', description: 'ANC, MagSafe', price: 24900, currency: 'USD', stock: 60, brand: 'Apple', categorySlug: 'headphones', media: ['https://picsum.photos/id/1051/800/600'] },
  { sku: 'SPK-BOSE-SNDLNK-FLEX', name: 'Bose SoundLink Flex', description: 'Portable Bluetooth speaker', price: 14900, currency: 'USD', stock: 45, brand: 'Bose', categorySlug: 'speakers', media: ['https://picsum.photos/id/1052/800/600'] },
  { sku: 'SPK-JBL-FLIP6', name: 'JBL Flip 6', description: 'Waterproof portable speaker', price: 12900, currency: 'USD', stock: 70, brand: 'JBL', categorySlug: 'speakers', media: ['https://picsum.photos/id/1053/800/600'] },
  { sku: 'SMH-HUE-STARTER', name: 'Philips Hue Starter Kit', description: 'Bridge + 2 bulbs', price: 19900, currency: 'USD', stock: 80, brand: 'Philips', categorySlug: 'lighting', media: ['https://picsum.photos/id/1060/800/600'] },
  { sku: 'SMH-NEST-THERMO', name: 'Nest Learning Thermostat', description: 'Smart thermostat (3rd gen)', price: 24900, currency: 'USD', stock: 25, brand: 'Google', categorySlug: 'smart-home', media: ['https://picsum.photos/id/1061/800/600'] },
  { sku: 'SMH-RING-DB4', name: 'Ring Video Doorbell 4', description: '1080p video, dual-band Wi-Fi', price: 19900, currency: 'USD', stock: 30, brand: 'Ring', categorySlug: 'security', media: ['https://picsum.photos/id/1062/800/600'] },
  { sku: 'GMG-XBOX-SERIES-X', name: 'Xbox Series X', description: '4K gaming console', price: 49900, currency: 'USD', stock: 18, brand: 'Microsoft', categorySlug: 'consoles', media: ['https://picsum.photos/id/1070/800/600'] },
  { sku: 'GMG-PS5-SLIM', name: 'PlayStation 5 Slim', description: 'Ultra-high speed SSD', price: 49900, currency: 'USD', stock: 16, brand: 'Sony', categorySlug: 'consoles', media: ['https://picsum.photos/id/1071/800/600'] },
  { sku: 'GMG-NSW-OLED', name: 'Nintendo Switch OLED', description: '7-inch OLED, dock', price: 34900, currency: 'USD', stock: 28, brand: 'Nintendo', categorySlug: 'consoles', media: ['https://picsum.photos/id/1072/800/600'] },
  { sku: 'ACC-LOGI-MX3S', name: 'Logitech MX Master 3S', description: 'Advanced wireless mouse', price: 9999, currency: 'USD', stock: 55, brand: 'Logitech', categorySlug: 'gaming-accessories', media: ['https://picsum.photos/id/1080/800/600'] },
  { sku: 'ACC-ANK-65W-USB-C', name: 'Anker 65W USB-C Charger', description: 'GaN fast charger', price: 5999, currency: 'USD', stock: 100, brand: 'Anker', categorySlug: 'gaming-accessories', media: ['https://picsum.photos/id/1081/800/600'] },
]

async function main() {
  console.log('Seeding electronics catalog...')

  // 1) Upsert categories by slug (first pass w/o parents)
  const idBySlug = new Map()
  for (const c of categories) {
    const up = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { slug: c.slug, name: c.name },
      select: { id: true },
    })
    idBySlug.set(c.slug, up.id)
  }

  // 2) Apply parent links in second pass
  for (const c of categories) {
    if (!c.parentSlug) continue
    const id = idBySlug.get(c.slug)
    const parentId = idBySlug.get(c.parentSlug)
    if (id && parentId) {
      await prisma.category.update({ where: { id }, data: { parentId } })
    }
  }

  // 3) Upsert products by SKU and media
  let upserts = 0
  for (const p of products) {
    const categoryId = p.categorySlug ? idBySlug.get(p.categorySlug) : null
    const baseData = {
      name: p.name,
      description: p.description,
      price: p.price,
      currency: p.currency,
      stock: p.stock ?? 0,
      brand: p.brand,
      categoryId,
      isActive: true,
    }
    const existing = await prisma.product.findUnique({ where: { sku: p.sku }, select: { id: true } })
    let productId
    if (existing) {
      const u = await prisma.product.update({ where: { sku: p.sku }, data: baseData, select: { id: true } })
      productId = u.id
    } else {
      const c = await prisma.product.create({ data: { sku: p.sku, ...baseData }, select: { id: true } })
      productId = c.id
    }
    upserts++

    await prisma.productMedia.deleteMany({ where: { productId } })
    if (p.media && p.media.length) {
      await prisma.productMedia.createMany({
        data: p.media.map((u, i) => ({ productId, url: u, kind: 'image', sortOrder: i })),
        skipDuplicates: true,
      })
    }
  }

  const counts = await prisma.$transaction([
    prisma.product.count(),
    prisma.category.count(),
    prisma.productMedia.count(),
  ])
  console.log(`Done. Upserts: products=${upserts}. Counts: products=${counts[0]} categories=${counts[1]} media=${counts[2]}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

