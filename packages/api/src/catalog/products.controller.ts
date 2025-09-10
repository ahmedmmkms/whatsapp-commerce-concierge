import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';

@Controller('/products')
export class ProductsController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  async list(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPriceRaw?: string,
    @Query('maxPrice') maxPriceRaw?: string,
    @Query('sort') sort?: 'price' | 'name' | 'newest',
    @Query('order') order?: 'asc' | 'desc',
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
  ) {
    const minPrice = this.toInt(minPriceRaw);
    const maxPrice = this.toInt(maxPriceRaw);
    return this.catalog.listProducts({ q, category, minPrice, maxPrice, sort, order, page, pageSize });
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const p = await this.catalog.getProduct(id);
    if (!p) return { ok: false, error: 'not found' };
    return { ok: true, product: p };
  }

  private toInt(v?: string) {
    if (v == null) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : undefined;
  }
}

