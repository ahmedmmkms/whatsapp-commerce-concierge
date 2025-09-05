import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('/healthz')
  health() {
    return {
      ok: true,
      service: 'whatsapp-concierge-api',
      version: process.env.npm_package_version || '0.0.1',
    };
  }
}

