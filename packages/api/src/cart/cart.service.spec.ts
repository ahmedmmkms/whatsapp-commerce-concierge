import { CartService } from './cart.service.js'

function makeSvc() {
  const prisma: any = {
    customer: { findUnique: jest.fn(), create: jest.fn() },
    conversation: { findUnique: jest.fn(), create: jest.fn() },
    cart: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    cartItem: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    product: { findUnique: jest.fn() },
    $transaction: jest.fn(async (cb: any) => {
      if (typeof cb === 'function') return cb(prisma)
      const calls = cb as any[]
      return Promise.all(calls.map((fn) => fn))
    }),
  }
  const cache: any = { isEnabled: () => false, get: jest.fn(), set: jest.fn() }
  const svc = new CartService(prisma as any, cache as any)
  return { prisma, cache, svc }
}

describe('CartService', () => {
  it('creates cart and adds item, computes totals', async () => {
    const { prisma, svc } = makeSvc()
    prisma.customer.findUnique.mockResolvedValue(null)
    prisma.customer.create.mockResolvedValue({ id: 'c1', waPhone: 'preview' })
    prisma.conversation.findUnique.mockResolvedValue(null)
    prisma.conversation.create.mockResolvedValue({ id: 'v1', customerId: 'c1' })
    prisma.cart.findFirst.mockResolvedValueOnce(null)
    prisma.cart.create.mockResolvedValue({ id: 'cart1', currency: 'USD', items: [] })
    prisma.product.findUnique.mockResolvedValue({ id: 'p1', sku: 'SKU1', name: 'Item', price: 1000, currency: 'USD' })
    prisma.cartItem.findUnique.mockResolvedValue(null)
    prisma.cartItem.create.mockResolvedValue({ id: 'ci1', cartId: 'cart1', qty: 1, priceSnapshotMinor: 1000, lineTotalMinor: 1000 })
    prisma.cartItem.findMany.mockResolvedValue([{ qty: 1, lineTotalMinor: 1000 }])
    prisma.cart.update.mockResolvedValue({})

    const item = await svc.addItem({ sku: 'SKU1', qty: 1 })
    expect(item).toBeDefined()
    expect(prisma.cart.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ subtotalMinor: 1000, totalMinor: 1000 })
    }))
  })

  it('increments qty when item exists', async () => {
    const { prisma, svc } = makeSvc()
    prisma.customer.findUnique.mockResolvedValue({ id: 'c1', waPhone: 'preview' })
    prisma.conversation.findUnique.mockResolvedValue({ id: 'v1', customerId: 'c1' })
    prisma.cart.findFirst.mockResolvedValue({ id: 'cart1', currency: 'USD', items: [] })
    prisma.product.findUnique.mockResolvedValue({ id: 'p1', sku: 'SKU1', name: 'Item', price: 1000, currency: 'USD' })
    prisma.cartItem.findUnique.mockResolvedValueOnce({ id: 'ci1', qty: 1, priceSnapshotMinor: 1000 })
    prisma.cartItem.update.mockResolvedValue({ id: 'ci1', qty: 2, priceSnapshotMinor: 1000, lineTotalMinor: 2000 })
    prisma.cartItem.findMany.mockResolvedValue([{ qty: 2, lineTotalMinor: 2000 }])

    await svc.addItem({ sku: 'SKU1', qty: 1 })
    expect(prisma.cartItem.update).toHaveBeenCalled()
    expect(prisma.cart.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ subtotalMinor: 2000 })
    }))
  })

  it('updates qty by sku and removes when qty=0', async () => {
    const { prisma, svc } = makeSvc()
    prisma.customer.findUnique.mockResolvedValue({ id: 'c1', waPhone: 'preview' })
    prisma.conversation.findUnique.mockResolvedValue({ id: 'v1', customerId: 'c1' })
    prisma.cart.findFirst.mockResolvedValue({ id: 'cart1', currency: 'USD', items: [] })
    prisma.cartItem.findFirst.mockResolvedValue({ id: 'ci1', cartId: 'cart1', sku: 'SKU1', priceSnapshotMinor: 1000 })
    prisma.cartItem.findMany.mockResolvedValue([{ qty: 0, lineTotalMinor: 0 }])

    await svc.updateItemQtyBySku(undefined, 'SKU1', 0)
    expect(prisma.cartItem.delete).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'ci1' } }))
  })
})

