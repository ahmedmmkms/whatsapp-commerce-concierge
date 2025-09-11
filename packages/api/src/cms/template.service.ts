import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TemplateService {
  constructor(private prisma: PrismaService) {}

  async get(key: string, locale: 'en' | 'ar' = 'en', channel: 'wa' | 'web' = 'wa') {
    const tpl = await this.prisma.template.findFirst({
      where: { key, channel, locale },
    });
    if (tpl) return tpl;
    // fallback to EN
    return this.prisma.template.findFirst({ where: { key, channel, locale: 'en' } });
  }

  interpolate(body: string, vars: Record<string, string | number | undefined>) {
    return body.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, p1) => (vars?.[p1] ?? '').toString());
  }
}

