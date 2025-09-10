import { CatalogService } from './catalog.service.js'

describe('CatalogService', () => {
  function makeSvc() {
    const prisma: any = {
      product: {
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockResolvedValue([{ id: 'p1', name: 'A', price: 1000, currency: 'USD', media: [], category: null }]),
      },
      category: {
        findMany: jest.fn().mockResolvedValue([{ id: 'c1', name: 'Apparel', slug: 'apparel', parentId: null, _count: { products: 1, children: 0 } }]),
      },
      productMedia: { count: jest.fn().mockResolvedValue(0) },
      $transaction: jest.fn(async (calls: any[]) => Promise.all(calls.map((fn) => fn))),
    }
    const cache: any = { get: jest.fn().mockResolvedValue(undefined), set: jest.fn().mockResolvedValue(undefined), metrics: () => ({ enabled: false, hits: 0, misses: 0, errors: 0 }) }
    const svc = new CatalogService(prisma, cache)
    return { prisma, cache, svc }
  }

  it('lists products with search and pagination', async () => {
    const { prisma, svc } = makeSvc()
    const r = await svc.listProducts({ q: 'tee', page: 2, pageSize: 10, sort: 'name', order: 'asc' })
    expect(r.total).toBe(1)
    expect(prisma.product.count).toHaveBeenCalledWith(expect.objectContaining({ where: expect.any(Object) }))
    expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
      orderBy: { name: 'asc' },
      skip: 10,
      take: 10,
    }))
  })

  it('filters by category slug', async () => {
    const { prisma, svc } = makeSvc()
    await svc.listProducts({ category: 'apparel' })
    // assert that where includes category slug filter via relation
    const args = (prisma.product.count as jest.Mock).mock.calls[0][0]
    expect(args.where.category.slug).toBe('apparel')
  })

  it('lists categories with counts and caches result', async () => {
    const { cache, svc } = makeSvc()
    const cats = await svc.listCategories()
    expect(Array.isArray(cats)).toBe(true)
    expect(cache.set).toHaveBeenCalled()
  })
})

