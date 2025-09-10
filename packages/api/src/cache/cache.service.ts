import { Injectable, OnModuleDestroy } from '@nestjs/common';
import IORedis, { Redis } from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private client?: Redis;
  private enabled = false;

  constructor() {
    const url = process.env.REDIS_URL; // expect standard Redis URL
    if (url) {
      this.client = new IORedis(url, { lazyConnect: true, maxRetriesPerRequest: 2 });
      this.enabled = true;
      // Try connecting in background
      this.client.connect().catch(() => { /* ignore */ });
    }
  }

  isEnabled() { return this.enabled && !!this.client; }

  async get<T = unknown>(key: string): Promise<T | undefined> {
    if (!this.client) return undefined;
    try {
      const v = await this.client.get(key);
      return v ? (JSON.parse(v) as T) : undefined;
    } catch {
      return undefined;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 900): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // ignore
    }
  }

  async onModuleDestroy() {
    if (this.client) await this.client.quit();
  }
}
