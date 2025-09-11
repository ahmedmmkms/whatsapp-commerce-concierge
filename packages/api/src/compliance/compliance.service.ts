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
    // Placeholder entry point kept for compatibility; use redactCustomer instead.
    return { ok: false, error: 'use_redact' } as const;
  }

  async redactCustomerByIdOrPhone({ customerId, phone, requestedBy }: { customerId?: string; phone?: string; requestedBy?: string }) {
    const customer = customerId
      ? await this.prisma.customer.findUnique({ where: { id: customerId } })
      : phone
      ? await this.prisma.customer.findUnique({ where: { waPhone: phone } })
      : null;
    if (!customer) return { ok: false, error: 'not_found' } as const;

    const audit = await this.prisma.complianceAudit.create({
      data: { action: 'delete', subjectType: 'customer', subjectId: customer.id, status: 'accepted', requestedBy },
    });

    try {
      await this.prisma.$transaction(async (tx) => {
        // Redact customer: replace phone with synthetic, clear name, set flags
        const redPhone = `redacted:${customer.id}`;
        await tx.customer.update({
          where: { id: customer.id },
          data: { waPhone: redPhone, waName: null, isRedacted: true, redactedAt: new Date() },
        });

        // Redact addresses linked to orders of this customer (PII fields)
        const orders = await tx.order.findMany({ where: { customerId: customer.id }, select: { addressId: true } });
        const addrIds = orders.map((o) => o.addressId).filter((x): x is string => !!x);
        if (addrIds.length) {
          await tx.address.updateMany({
            where: { id: { in: addrIds } },
            data: { name: null, phone: null, line1: 'REDACTED', line2: null, postalCode: null },
          });
        }

        // Redact consents policyText if any PII (keep consent boolean)
        await tx.consent.updateMany({ where: { customerId: customer.id }, data: { policyText: null } });

        await tx.complianceAudit.update({ where: { id: audit.id }, data: { status: 'succeeded' } });
      });
      return { ok: true, auditId: audit.id } as const;
    } catch (err: any) {
      await this.prisma.complianceAudit.update({ where: { id: audit.id }, data: { status: 'failed', details: { error: err?.message || String(err) } as any } });
      return { ok: false, error: 'failed' } as const;
    }
  }
}
