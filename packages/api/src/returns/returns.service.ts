import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ReturnsService {
  constructor(private prisma: PrismaService) {}

  async create(orderId: string, reason?: string, notes?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return { ok: false, error: 'order_not_found' } as const;
    // Eligibility window (days since order created)
    const days = Number.parseInt(process.env.RETURNS_ELIGIBLE_DAYS ?? '30');
    const cutoff = new Date(order.createdAt.getTime() + days * 24 * 60 * 60 * 1000);
    if (new Date() > cutoff) {
      return { ok: false, error: 'not_eligible' } as const;
    }
    // Simple one-open-return rule
    const open = await this.prisma.return.findFirst({ where: { orderId, status: { in: ['requested', 'approved', 'in_transit'] } } });
    if (open) return { ok: false, error: 'existing_open_return' } as const;
    const rmaCode = 'RMA-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    const ret = await this.prisma.return.create({ data: { orderId, status: 'requested', reason, notes, rmaCode } });
    return { ok: true, id: ret.id, rmaCode } as const;
  }
}
