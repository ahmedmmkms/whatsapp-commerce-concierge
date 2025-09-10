import { Injectable, OnModuleDestroy } from '@nestjs/common';
import IORedis, { Redis } from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private client?: Redis;
  private enabled = false;
  private hits = 0;
  private misses = 0;
  private errors = 0;
  private warned = false;

  constructor() {
    if (process.env.CACHE_DISABLED === '1') {
      this.enabled = false;
      return;
    }
    const url = process.env.REDIS_URL; // expect standard Redis URL
    if (url) {
      this.client = new IORedis(url, {
        lazyConnect: true,
        maxRetriesPerRequest: 0,
        connectTimeout: 3000,
        retryStrategy: (times) => Math.min(times * 200, 1000),
      });
      this.client.on('error', (err) => {
        this.errors++;
        // Avoid noisy unhandled error; log once with hint for operators
        if (!this.warned) {
          this.warned = true;
          // eslint-disable-next-line no-console
          console.warn('[cache] Redis connection issue; caching will be skipped. Set REDIS_URL or set CACHE_DISABLED=1 to suppress.', String(err?.message || err));
        }
      });
      this.enabled = true;
      // Do not eagerly connect in serverless; operations will attempt when used
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
    return { enabled: this.enabled && !!this.client, hits: this.hits, misses: this.misses, errors: this.errors };
  }
}
