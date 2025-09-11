import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('orders')
export class OrdersController {
  constructor(private prisma: PrismaService) {}

  @Get(':id')
  async get(@Param('id') id: string) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: { items: true, payments: true, address: true } });
    if (!order) return { ok: false, error: 'not found' };
    return { ok: true, order };
  }
}

