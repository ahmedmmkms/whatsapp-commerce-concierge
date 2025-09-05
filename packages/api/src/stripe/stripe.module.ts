import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller.js';

@Module({
  controllers: [StripeController],
})
export class StripeModule {}

