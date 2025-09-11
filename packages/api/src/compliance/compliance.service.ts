import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaService) {}

  async getStatus() {
    return {
      ok: true,
      pdpl: {
        exportSupported: true,
        deleteSupported: false, // planned: redaction/soft-delete workflow
      },
    } as const;
  }

  async exportByCustomer({ customerId, phone }: { customerId?: string; phone?: string }) {
    const customer = customerId
      ? await this.prisma.customer.findUnique({ where: { id: customerId } })
      : phone
      ? await this.prisma.customer.findUnique({ where: { waPhone: phone } })
      : null;
    if (!customer) return { ok: false, error: 'not_found' } as const;

    const [convos, consents, orders, returns] = await Promise.all([
      this.prisma.conversation.findMany({ where: { customerId: customer.id } }),
      this.prisma.consent.findMany({ where: { customerId: customer.id } }),
      this.prisma.order.findMany({ where: { customerId: customer.id }, include: { items: true, payments: true, events: true, returns: true } }),
      this.prisma.return.findMany({ where: { order: { customerId: customer.id } }, include: { items: true, order: true } }),
    ]);

    const data = {
      customer: { id: customer.id, waPhone: customer.waPhone, waName: customer.waName, createdAt: customer.createdAt },
      conversations: convos,
      consents,
      orders,
      returns,
      exportGeneratedAt: new Date().toISOString(),
    };

    // For MVP, return inline JSON; future: generate signed, expiring URL
    return { ok: true, data } as const;
  }

  async scheduleDelete() {
    // Placeholder until redaction workflow is implemented
    return { ok: false, error: 'not_implemented' } as const;
  }
}

