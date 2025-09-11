import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [OrdersController],
})
export class OrdersModule {}

