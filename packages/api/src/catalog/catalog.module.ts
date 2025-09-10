import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ProductsController } from './products.controller.js';
import { CategoriesController } from './categories.controller.js';
import { CatalogAdminController } from './catalogAdmin.controller.js';
import { CatalogService } from './catalog.service.js';
import { CacheModule } from '../cache/cache.module.js';

@Module({
  imports: [PrismaModule, CacheModule],
  controllers: [ProductsController, CategoriesController, CatalogAdminController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
