import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

function resolvePrismaLogs() {
  const env = process.env.PRISMA_LOG || '';
  const parts = env.split(',').map((s) => s.trim()).filter(Boolean);
  const allowed = new Set(['query', 'info', 'warn', 'error']);
  const levels = parts.filter((p) => allowed.has(p));
  return levels.length ? (levels as ('query' | 'info' | 'warn' | 'error')[]) : [];
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super({ log: resolvePrismaLogs().map((l) => ({ emit: 'stdout', level: l })) });
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
