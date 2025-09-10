import { Controller, Get } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';

@Controller('/categories')
export class CategoriesController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  async list() {
    const cats = await this.catalog.listCategories();
    return { ok: true, categories: cats };
  }
}

