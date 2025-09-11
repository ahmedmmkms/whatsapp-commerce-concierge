import { Controller, Get, Post, HttpException, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { AdminTokenGuard } from '../common/admin-token.guard.js';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import type { Redis, RedisOptions } from 'ioredis';

function sanitizeUrl(raw: string | undefined): { raw: string | undefined; value: string | null; u: URL | null } {
  if (!raw) return { raw, value: null, u: null };
  const trimmed = raw.trim().replace(/^"(.*)"$/, '$1'); // strip surrounding quotes if present
  try {
    const u = new URL(trimmed);
    return { raw, value: trimmed, u };
  } catch {
    return { raw, value: trimmed, u: null };
  }
}

function getRedisConnection(): Redis | null {
  const s = sanitizeUrl(process.env.REDIS_URL);
  const url = s.value || 'redis://localhost:6379';
  if (!s.value) {
    // In serverless/prod, missing REDIS_URL will fail; let caller handle
    return null;
  }
  const isTls = s.u?.protocol === 'rediss:';
  const options: RedisOptions = {
    // Fail fast in serverless; avoid long hangs/retries
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT_MS || 8000),
    // Prefer IPv4 to avoid some dual-stack latency issues
    family: 4,
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
      const s = sanitizeUrl(process.env.REDIS_URL);
      const u = s.u;
      return {
        ok: pong === 'PONG',
        redis: pong,
        endpoint: u ? `${u.protocol}//${u.hostname}:${u.port}` : undefined,
        queues: { whatsapp: counts },
      };
    } catch (err: any) {
      const s = sanitizeUrl(process.env.REDIS_URL);
      const u = s.u;
      const ep = u ? `${u.protocol}//${u.hostname}:${u.port}` : undefined;
      const msg = `Redis error: ${err?.message || err}${ep ? ` (endpoint ${ep})` : ''}`;
      throw new HttpException({ statusCode: HttpStatus.SERVICE_UNAVAILABLE, message: msg }, HttpStatus.SERVICE_UNAVAILABLE);
    } finally {
      try { if (q) await q.close(); } catch {}
      try { await (redis as Redis).quit(); } catch {}
    }
  }

  @Get('/dlq/stats')
  async dlqStats() {
    if (!process.env.REDIS_URL) {
      throw new HttpException({ statusCode: HttpStatus.SERVICE_UNAVAILABLE, message: 'Redis not configured' }, HttpStatus.SERVICE_UNAVAILABLE);
    }
    const redis = getRedisConnection();
    let q: Queue | undefined;
    let dlq: Queue | undefined;
    try {
      q = getQueue('whatsapp', redis as Redis);
      dlq = getQueue('whatsapp:dlq', redis as Redis);
      const qCounts = await q.getJobCounts('wait', 'active', 'completed', 'failed', 'delayed');
      const dlqCounts = await dlq.getJobCounts('wait', 'active', 'completed', 'failed', 'delayed');
      return { ok: true, primary: qCounts, dlq: dlqCounts };
    } finally {
      try { if (q) await q.close(); } catch {}
      try { if (dlq) await dlq.close(); } catch {}
      try { await (redis as Redis).quit(); } catch {}
    }
  }

  @Post('/dlq/requeue')
  @UseGuards(AdminTokenGuard)
  async requeueFromDlq(@Query('limit') limitStr?: string) {
    if (!process.env.REDIS_URL) {
      throw new HttpException({ statusCode: HttpStatus.SERVICE_UNAVAILABLE, message: 'Redis not configured' }, HttpStatus.SERVICE_UNAVAILABLE);
    }
    const limit = Math.max(1, Math.min(200, Number(limitStr) || 50));
    const redis = getRedisConnection();
    let q: Queue | undefined;
    let dlq: Queue | undefined;
    try {
      q = getQueue('whatsapp', redis as Redis);
      dlq = getQueue('whatsapp:dlq', redis as Redis);
      const jobs = await dlq.getJobs(['wait', 'delayed'], 0, limit - 1);
      if (!jobs.length) return { ok: true, moved: 0 };
      const data = jobs.map((j) => ({ name: j.name || 'dlq', data: j.data, opts: j.opts }));
      await q.addBulk(data);
      for (const j of jobs) {
        try { await j.remove(); } catch {}
      }
      return { ok: true, moved: jobs.length };
    } finally {
      try { if (q) await q.close(); } catch {}
      try { if (dlq) await dlq.close(); } catch {}
      try { await (redis as Redis).quit(); } catch {}
    }
  }

  @Post('/mirror-failed-to-dlq')
  @UseGuards(AdminTokenGuard)
  async mirrorFailedToDlq(@Query('limit') limitStr?: string) {
    if (!process.env.REDIS_URL) {
      throw new HttpException({ statusCode: HttpStatus.SERVICE_UNAVAILABLE, message: 'Redis not configured' }, HttpStatus.SERVICE_UNAVAILABLE);
    }
    const limit = Math.max(1, Math.min(200, Number(limitStr) || 50));
    const redis = getRedisConnection();
    let q: Queue | undefined;
    let dlq: Queue | undefined;
    try {
      q = getQueue('whatsapp', redis as Redis);
      dlq = getQueue('whatsapp:dlq', redis as Redis);
      const failed = await q.getJobs(['failed'], 0, limit - 1);
      if (!failed.length) return { ok: true, mirrored: 0 };
      const data = failed.map((j) => ({ name: j.name || 'failed', data: j.data, opts: j.opts }));
      await dlq.addBulk(data);
      return { ok: true, mirrored: failed.length };
    } finally {
      try { if (q) await q.close(); } catch {}
      try { if (dlq) await dlq.close(); } catch {}
      try { await (redis as Redis).quit(); } catch {}
    }
  }
}
