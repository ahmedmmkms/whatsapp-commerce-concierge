import { Body, Controller, Delete, Get, Headers, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service.js';
import { AdminTokenGuard } from '../common/admin-token.guard.js';
import { CreateTemplateDto } from './dto/create-template.dto.js';
import { UpdateTemplateDto } from './dto/update-template.dto.js';
import type { Prisma } from '@prisma/client';

@ApiTags('CMS')
@Controller('cms/templates')
export class TemplatesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List active templates' })
  @ApiOkResponse({ description: 'Active templates' })
  async list() {
    const templates = await this.prisma.template.findMany({ where: { isActive: true } });
    return { ok: true, templates };
  }

  @Post()
  @UseGuards(AdminTokenGuard)
  @ApiOperation({ summary: 'Create or upsert a template' })
  async create(@Body() dto: CreateTemplateDto) {
    const tpl = await this.prisma.template.upsert({
      where: { key_locale_channel: { key: dto.key, locale: dto.locale, channel: dto.channel } },
      update: { body: dto.body, variables: dto.variables as unknown as Prisma.InputJsonValue, isActive: dto.isActive ?? true, updatedBy: dto.updatedBy },
      create: { key: dto.key, locale: dto.locale, channel: dto.channel, body: dto.body, variables: dto.variables as unknown as Prisma.InputJsonValue, isActive: dto.isActive ?? true, updatedBy: dto.updatedBy },
    });
    return { ok: true, template: tpl };
  }

  @Put(':id')
  @UseGuards(AdminTokenGuard)
  @ApiOperation({ summary: 'Update a template by ID' })
  @ApiParam({ name: 'id' })
  async update(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    const tpl = await this.prisma.template.update({ where: { id }, data: { body: dto.body, variables: dto.variables as unknown as Prisma.InputJsonValue, isActive: dto.isActive, updatedBy: dto.updatedBy } });
    return { ok: true, template: tpl };
  }

  @Delete(':id')
  @UseGuards(AdminTokenGuard)
  @ApiOperation({ summary: 'Delete a template by ID' })
  @ApiParam({ name: 'id' })
  async remove(@Param('id') id: string) {
    await this.prisma.template.delete({ where: { id } });
    return { ok: true };
  }
}
