import { Injectable, OnModuleDestroy } from '@nestjs/common';
import IORedis, { Redis } from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private client?: Redis;
  private enabled = false;
  private hits = 0;
  private misses = 0;

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
      if (v) {
        this.hits++;
        return JSON.parse(v) as T;
      }
      this.misses++;
      return undefined;
    } catch {
      this.misses++;
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

  metrics() {
    return { enabled: this.enabled, hits: this.hits, misses: this.misses };
  }
}
