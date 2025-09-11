import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service.js';
import { CheckoutController } from './checkout.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CartModule } from '../cart/cart.module.js';

@Module({
  imports: [PrismaModule, CartModule],
  controllers: [CheckoutController],
  providers: [CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}

