import { Controller, Get } from '@nestjs/common';
import { Queue, QueueEvents, Worker } from 'bullmq';
import IORedis from 'ioredis';

function getRedisConnection() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  return new IORedis(url);
}

function getQueue(name: string) {
  const connection = getRedisConnection();
  return new Queue(name, { connection });
}

@Controller('/queue')
export class QueueHealthController {
  @Get('/health')
  async health() {
    const redis = getRedisConnection();
    try {
      const pong = await redis.ping();
      const q = getQueue('whatsapp');
      const counts = await q.getJobCounts('wait', 'active', 'completed', 'failed', 'delayed');
      return {
        ok: pong === 'PONG',
        redis: pong,
        queues: {
          whatsapp: counts,
        },
      };
    } finally {
      // Close connection to avoid handle leaks in serverless/local
      await redis.quit();
    }
  }
}

