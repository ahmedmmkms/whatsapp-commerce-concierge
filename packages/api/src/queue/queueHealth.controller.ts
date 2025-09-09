import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import type { Redis } from 'ioredis';

function getRedisConnection(): Redis | null {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  if (!process.env.REDIS_URL) {
    // In serverless/prod, missing REDIS_URL will fail; let caller handle
    return null;
  }
  return new (IORedis as any)(url) as Redis;
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
      const pong = await (redis as Redis).ping();
      q = getQueue('whatsapp', redis as Redis);
      const counts = await q.getJobCounts('wait', 'active', 'completed', 'failed', 'delayed');
      return {
        ok: pong === 'PONG',
        redis: pong,
        queues: { whatsapp: counts },
      };
    } catch (err: any) {
      throw new HttpException(
        { statusCode: HttpStatus.SERVICE_UNAVAILABLE, message: `Redis error: ${err?.message || err}` },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } finally {
      try { if (q) await q.close(); } catch {}
      try { await (redis as Redis).quit(); } catch {}
    }
  }
}
