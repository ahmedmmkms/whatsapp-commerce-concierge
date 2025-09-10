import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './health/health.module.js';
import { WhatsappModule } from './whatsapp/whatsapp.module.js';
import { StripeModule } from './stripe/stripe.module.js';
import { QueueModule } from './queue/queue.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ConsentModule } from './consent/consent.module.js';
import { CatalogModule } from './catalog/catalog.module.js';

import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60, limit: 100 }] }),
    PrismaModule,
    HealthModule,
    WhatsappModule,
    StripeModule,
    QueueModule,
    ConsentModule,
    CatalogModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
