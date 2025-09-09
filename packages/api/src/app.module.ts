import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './health/health.module.js';
import { WhatsappModule } from './whatsapp/whatsapp.module.js';
import { StripeModule } from './stripe/stripe.module.js';
import { QueueModule } from './queue/queue.module.js';

import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60, limit: 100 }] }),
    HealthModule,
    WhatsappModule,
    StripeModule,
    QueueModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
