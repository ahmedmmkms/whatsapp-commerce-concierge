import { Module } from '@nestjs/common';
import { CartController } from './cart.controller.js';
import { CartService } from './cart.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CacheModule } from '../cache/cache.module.js';

@Module({
  imports: [PrismaModule, CacheModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
