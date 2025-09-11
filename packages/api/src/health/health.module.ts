import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { DbHealthController, MetricsController } from './health.controller.js';
import { MetricsService } from './metrics.service.js';

@Module({
  controllers: [HealthController, DbHealthController, MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class HealthModule {}
