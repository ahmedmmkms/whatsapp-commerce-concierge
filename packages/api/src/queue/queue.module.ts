import { Module } from '@nestjs/common';
import { QueueHealthController } from './queueHealth.controller.js';

@Module({
  controllers: [QueueHealthController],
})
export class QueueModule {}

