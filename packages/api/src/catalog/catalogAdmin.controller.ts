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
    // Stub: in future, enqueue a job to fetch and upsert the feed
    return { ok: true, scheduled: true };
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

