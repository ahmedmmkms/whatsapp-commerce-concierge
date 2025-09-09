import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import type { Redis, RedisOptions } from 'ioredis';

function getRedisConnection(): Redis | null {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  if (!process.env.REDIS_URL) {
    // In serverless/prod, missing REDIS_URL will fail; let caller handle
    return null;
  }
  const isTls = url.startsWith('rediss://');
  const options: RedisOptions = {
    // Fail fast in serverless; avoid long hangs/retries
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT_MS || 8000),
    // ioredis auto-enables TLS for rediss, but be explicit
    tls: isTls ? {} : undefined,
  } as RedisOptions;
  return new (IORedis as any)(url, options) as Redis;
}

function getQueue(name: string, connection: Redis) {
  return new Queue(name, { connection: connection as any });
}

@Controller('/queue')
export class QueueHealthController {
  @Get('/health')
  async health() {
    if (!process.env.REDIS_URL) {
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Redis not configured. Set REDIS_URL (e.g., Upstash rediss://...)',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const redis = getRedisConnection();
    let q: Queue | undefined;
    try {
      const pingTimeoutMs = Number(process.env.REDIS_PING_TIMEOUT_MS || 8000);
      const pong = await Promise.race([
        (redis as Redis).ping(),
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error('ping timeout')), pingTimeoutMs)),
      ]);
      q = getQueue('whatsapp', redis as Redis);
      const counts = await q.getJobCounts('wait', 'active', 'completed', 'failed', 'delayed');
      const u = new URL(process.env.REDIS_URL as string);
      return {
        ok: pong === 'PONG',
        redis: pong,
        endpoint: `${u.protocol}//${u.hostname}:${u.port}`,
        queues: { whatsapp: counts },
      };
    } catch (err: any) {
      const u = (() => { try { return new URL(process.env.REDIS_URL as string); } catch { return null; } })();
      const ep = u ? `${u.protocol}//${u.hostname}:${u.port}` : undefined;
      const msg = `Redis error: ${err?.message || err}${ep ? ` (endpoint ${ep})` : ''}`;
      throw new HttpException({ statusCode: HttpStatus.SERVICE_UNAVAILABLE, message: msg }, HttpStatus.SERVICE_UNAVAILABLE);
    } finally {
      try { if (q) await q.close(); } catch {}
      try { await (redis as Redis).quit(); } catch {}
    }
  }
}
