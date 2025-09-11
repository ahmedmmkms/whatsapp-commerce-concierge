import { Body, Controller, Delete, Get, Headers, Param, Post, Put } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('cms/templates')
export class TemplatesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async list() {
    const templates = await this.prisma.template.findMany({ where: { isActive: true } });
    return { ok: true, templates };
  }

  private isAdmin(token?: string) {
    const expected = process.env.ADMIN_TOKEN || process.env.CMS_ADMIN_TOKEN;
    return expected && token && token === expected;
  }

  @Post()
  async create(@Headers('x-admin-token') token: string, @Body() body: any) {
    if (!this.isAdmin(token)) return { ok: false, error: 'forbidden' };
    const { key, locale, channel, body: tplBody, variables, isActive = true, updatedBy } = body ?? {};
    if (!key || !locale || !channel || !tplBody) return { ok: false, error: 'invalid' };
    const tpl = await this.prisma.template.upsert({
      where: { key_locale_channel: { key, locale, channel } },
      update: { body: tplBody, variables, isActive, updatedBy },
      create: { key, locale, channel, body: tplBody, variables, isActive, updatedBy },
    });
    return { ok: true, template: tpl };
  }

  @Put(':id')
  async update(@Headers('x-admin-token') token: string, @Param('id') id: string, @Body() body: any) {
    if (!this.isAdmin(token)) return { ok: false, error: 'forbidden' };
    const { body: tplBody, variables, isActive, updatedBy } = body ?? {};
    const tpl = await this.prisma.template.update({ where: { id }, data: { body: tplBody, variables, isActive, updatedBy } });
    return { ok: true, template: tpl };
  }

  @Delete(':id')
  async remove(@Headers('x-admin-token') token: string, @Param('id') id: string) {
    if (!this.isAdmin(token)) return { ok: false, error: 'forbidden' };
    await this.prisma.template.delete({ where: { id } });
    return { ok: true };
  }
}
