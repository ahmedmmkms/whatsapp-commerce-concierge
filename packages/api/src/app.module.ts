import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module.js';
import { WhatsappModule } from './whatsapp/whatsapp.module.js';
import { StripeModule } from './stripe/stripe.module.js';

@Module({
  imports: [HealthModule, WhatsappModule, StripeModule],
})
export class AppModule {}

