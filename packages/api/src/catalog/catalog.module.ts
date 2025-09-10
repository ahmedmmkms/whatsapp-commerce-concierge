import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ProductsController } from './products.controller.js';
import { CategoriesController } from './categories.controller.js';
import { CatalogAdminController } from './catalogAdmin.controller.js';
import { CatalogService } from './catalog.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [ProductsController, CategoriesController, CatalogAdminController],
  providers: [CatalogService],
})
export class CatalogModule {}

