import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('cms/templates')
export class TemplatesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async list() {
    const templates = await this.prisma.template.findMany({ where: { isActive: true } });
    return { ok: true, templates };
  }
}

