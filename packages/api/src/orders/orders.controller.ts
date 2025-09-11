import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service.js';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List recent orders by phone (E.164)' })
  @ApiQuery({ name: 'phone', required: true })
  @ApiOkResponse({ description: 'Orders list (redacted)' })
  async listByPhone(@Query('phone') phone?: string) {
    if (!phone) {
      return { ok: false, error: 'missing phone' };
    }
    // Find customer by WA phone and return recent orders in redacted summary
    const customer = await this.prisma.customer.findUnique({ where: { waPhone: phone } });
    if (!customer) return { ok: true, orders: [] };
    const orders = await this.prisma.order.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        createdAt: true,
        status: true,
        totalMinor: true,
        currency: true,
      },
    });
    return { ok: true, orders };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by id' })
  async get(@Param('id') id: string) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: { items: true, payments: true, address: true } });
    if (!order) return { ok: false, error: 'not found' };
    return { ok: true, order };
  }
}
