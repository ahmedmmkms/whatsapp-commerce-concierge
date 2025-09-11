import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service.js';
import { ReturnsService } from './returns.service.js';
import { CreateReturnDto } from './dto/create-return.dto.js';

@ApiTags('Returns')
@Controller('returns')
export class ReturnsController {
  constructor(private prisma: PrismaService, private svc: ReturnsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a return for an order' })
  @Throttle(3, 60)
  async create(@Body() dto: CreateReturnDto) {
    if (!dto?.orderId) return { ok: false, error: 'invalid' };
    const res = await this.svc.create(dto.orderId, dto.reason, dto.notes);
    if (!res.ok) {
      return { ok: false, error: res.error };
    }
    return { ok: true, id: res.id, rmaCode: res.rmaCode };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get return by id' })
  @ApiParam({ name: 'id' })
  async get(@Param('id') id: string) {
    const ret = await this.prisma.return.findUnique({ where: { id }, include: { items: true } });
    if (!ret) return { ok: false, error: 'not_found' };
    return { ok: true, return: ret };
  }

  @Get()
  @ApiOperation({ summary: 'List returns for an order' })
  @ApiQuery({ name: 'orderId', required: true })
  @Throttle(10, 60)
  async list(@Query('orderId') orderId?: string) {
    if (!orderId) return { ok: false, error: 'missing orderId' };
    const rets = await this.prisma.return.findMany({ where: { orderId }, orderBy: { createdAt: 'desc' } });
    return { ok: true, returns: rets };
  }
}
