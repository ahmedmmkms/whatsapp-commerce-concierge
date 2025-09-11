#!/usr/bin/env node
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const COUNT = parseInt(process.env.SEED_ORDERS_COUNT || process.argv[2] || '3', 10)
const PHONE = process.env.SEED_PHONE || '+10000000000'

function pick(arr, n) {
  return arr.slice(0, Math.max(1, Math.min(n, arr.length)))
}

async function ensureCustomer(phone) {
  let customer = await prisma.customer.findUnique({ where: { waPhone: phone } })
  if (!customer) {
    customer = await prisma.customer.create({ data: { waPhone: phone, waName: 'Seed User' } })
  }
  let convo = await prisma.conversation.findUnique({ where: { customerId: customer.id } })
  if (!convo) {
    convo = await prisma.conversation.create({ data: { customerId: customer.id } })
  }
  return { customer, convo }
}

async function productsSample() {
  const prods = await prisma.product.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' }, take: 5 })
  if (prods.length === 0) throw new Error('No products found. Seed catalog first.')
  return prods
}

function moneySum(items) {
  return items.reduce((sum, it) => sum + it.lineTotalMinor, 0)
}

async function createOrder({ customer, convo, products }) {
  const items = pick(products.map(p => ({
    productId: p.id,
    sku: p.sku,
    nameSnapshot: p.name,
    priceSnapshotMinor: p.price,
    currency: p.currency,
    qty: 1,
    lineTotalMinor: p.price * 1,
  })), 2)
  const totalMinor = moneySum(items)
  const order = await prisma.order.create({
    data: {
      customerId: customer.id,
      conversationId: convo.id,
      currency: items[0].currency,
      subtotalMinor: totalMinor,
      taxMinor: 0,
      shippingMinor: 0,
      totalMinor,
      status: 'pending_cod',
      items: { create: items },
      payments: { create: { provider: 'cod', status: 'pending', amountMinor: totalMinor, currency: items[0].currency } },
    },
  })
  return order
}

async function main() {
  const { customer, convo } = await ensureCustomer(PHONE)
  const prods = await productsSample()
  for (let i = 0; i < COUNT; i++) {
    const ord = await createOrder({ customer, convo, products: prods })
    console.log(`Created order ${ord.id} for ${customer.waPhone}`)
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

