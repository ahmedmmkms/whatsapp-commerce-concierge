import { Controller, Get } from '@nestjs/common';
import { MetricsService } from './metrics.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller()
export class HealthController {
  constructor(private readonly prisma?: PrismaService) {}
  @Get('/healthz')
  health() {
    return {
      ok: true,
      service: 'whatsapp-concierge-api',
      version: process.env.npm_package_version || '0.0.1',
      uptimeSeconds: process.uptime(),
      now: new Date().toISOString(),
    };
  }
}

@Controller('/db')
export class DbHealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('/health')
  async dbHealth() {
    try {
      // Lazy connect and simple query
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const r = await this.prisma.$queryRaw`SELECT 1 as ok`;
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err?.message || String(err) };
    }
  }
}

@Controller('/health')
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}
  @Get('/metrics')
  metricsJson() {
    return this.metrics.snapshot();
  }
}
