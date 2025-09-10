import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { demoFeed, type DemoCategory, type DemoProduct } from './demoFeed.js';

export type ProductQuery = {
  q?: string;
  category?: string; // slug
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price' | 'name' | 'newest';
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
};

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts(params: ProductQuery) {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
    const skip = (page - 1) * pageSize;
    const orderBy = this.mapOrder(params.sort || 'newest', params.order || 'desc');

    // Build where clause
    const where: any = { isActive: true };
    if (params.q) {
      const q = params.q.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (params.minPrice != null || params.maxPrice != null) {
      where.price = {};
      if (params.minPrice != null) where.price.gte = params.minPrice;
      if (params.maxPrice != null) where.price.lte = params.maxPrice;
    }
    if (params.category) {
      where.category = { slug: params.category };
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: { media: { orderBy: { sortOrder: 'asc' }, take: 1 }, category: true },
      }),
    ]);

    return { total, page, pageSize, items };
  }

  async getProduct(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { media: { orderBy: { sortOrder: 'asc' } }, category: true },
    });
  }

  async listCategories() {
    return this.prisma.category.findMany({
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: true, children: true } }, parent: true },
    });
  }

  async counts() {
    const [products, categories, media] = await this.prisma.$transaction([
      this.prisma.product.count(),
      this.prisma.category.count(),
      this.prisma.productMedia.count(),
    ]);
    return { products, categories, media };
  }

  private mapOrder(sort: string, order: 'asc' | 'desc') {
    switch (sort) {
      case 'price':
        return { price: order } as const;
      case 'name':
        return { name: order } as const;
      case 'newest':
      default:
        return { createdAt: order } as const;
    }
  }

  async syncDemoFeed() {
    // Upsert categories by slug
    const catIdBySlug = new Map<string, string>();

    // First pass: ensure categories exist (no parent linkage yet)
    for (const c of demoFeed.categories) {
      const existing = await this.prisma.category.findUnique({ where: { slug: c.slug } });
      if (existing) {
        const updated = await this.prisma.category.update({ where: { id: existing.id }, data: { name: c.name } });
        catIdBySlug.set(c.slug, updated.id);
      } else {
        const created = await this.prisma.category.create({ data: { slug: c.slug, name: c.name } });
        catIdBySlug.set(c.slug, created.id);
      }
    }

    // Second pass: set parent relationships
    for (const c of demoFeed.categories) {
      if (!c.parentSlug) continue;
      const id = catIdBySlug.get(c.slug);
      const parentId = catIdBySlug.get(c.parentSlug);
      if (id && parentId) {
        await this.prisma.category.update({ where: { id }, data: { parentId } });
      }
    }

    // Upsert products by sku
    let productUpserts = 0;
    for (const p of demoFeed.products) {
      const categoryId = p.categorySlug ? catIdBySlug.get(p.categorySlug) : undefined;
      const data = {
        name: p.name,
        description: p.description,
        price: p.price,
        currency: p.currency,
        stock: p.stock ?? 0,
        brand: p.brand,
        attributes: p.attributes as any,
        categoryId,
        isActive: true,
      } as const;

      const existing = await this.prisma.product.findUnique({ where: { sku: p.sku } });
      let product;
      if (existing) {
        product = await this.prisma.product.update({ where: { sku: p.sku }, data });
      } else {
        product = await this.prisma.product.create({ data: { sku: p.sku, ...data } });
      }
      productUpserts++;
      // Reset media
      await this.prisma.productMedia.deleteMany({ where: { productId: product.id } });
      if (p.media && p.media.length) {
        await this.prisma.productMedia.createMany({
          data: p.media.map((m, idx) => ({
            productId: product.id,
            url: m.url,
            kind: (m.kind || 'image') as any,
            sortOrder: m.sortOrder ?? idx,
          })),
          skipDuplicates: true,
        });
      }
    }

    const counts = await this.counts();
    return { ok: true, categories: demoFeed.categories.length, products: productUpserts, counts };
  }
}
