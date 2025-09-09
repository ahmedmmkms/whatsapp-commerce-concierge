import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

class UpsertConsentDto {
  phone!: string;
  granted!: boolean;
  channel?: string; // default whatsapp
  policyText?: string;
  policyVersion?: string;
}

@Controller('/consents')
export class ConsentController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async upsert(@Body() dto: UpsertConsentDto) {
    const phone = (dto.phone || '').trim();
    if (!phone) {
      return { ok: false, error: 'phone required' };
    }
    const granted = !!dto.granted;
    const channel = (dto.channel || 'whatsapp').toLowerCase();
    try {
      const customer = await this.prisma.customer.upsert({
        where: { waPhone: phone },
        update: {},
        create: { waPhone: phone },
      });

      const consent = await this.prisma.consent.create({
        data: {
          customerId: customer.id,
          granted,
          channel,
          policyText: dto.policyText,
          policyVersion: dto.policyVersion,
        },
      });

      return { ok: true, id: consent.id, customerId: customer.id };
    } catch (err: any) {
      return { ok: false, error: `db error: ${err?.message || err}` };
    }
  }

  @Get(':phone')
  async list(@Param('phone') phone: string) {
    try {
      const customer = await this.prisma.customer.findUnique({ where: { waPhone: phone } });
      if (!customer) return { ok: true, consents: [] };
      const consents = await this.prisma.consent.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: 'desc' } });
      return { ok: true, consents };
    } catch (err: any) {
      return { ok: false, error: `db error: ${err?.message || err}`, consents: [] };
    }
  }
}

