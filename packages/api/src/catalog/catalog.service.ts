import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

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
}

