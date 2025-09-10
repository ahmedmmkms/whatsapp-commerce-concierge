import { Controller, Get, Headers, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';

@Controller('/catalog')
export class CatalogAdminController {
  constructor(private readonly catalog: CatalogService) {}

  private isAuthorized(key?: string) {
    const expected = process.env.CATALOG_SYNC_KEY;
    if (!expected) return false;
    return !!key && key === expected;
  }

  @Post('sync')
  @HttpCode(HttpStatus.ACCEPTED)
  async sync(@Headers('x-catalog-sync-key') key?: string) {
    if (!this.isAuthorized(key)) {
      return { ok: false, error: 'forbidden' };
    }
    // For Sprint 2: sync from demo feed synchronously
    const result = await this.catalog.syncDemoFeed();
    return { ok: true, scheduled: false, result };
  }

  @Get('health')
  async health() {
    const counts = await this.catalog.counts();
    return {
      ok: true,
      counts,
      lastSyncAt: null, // placeholder until sync job stores status
    };
  }
}
