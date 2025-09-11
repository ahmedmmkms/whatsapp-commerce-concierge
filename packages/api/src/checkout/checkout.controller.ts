import { Body, Controller, Headers, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { CheckoutService } from './checkout.service.js';
import { CheckoutInitDto } from './dto/checkout-init.dto.js';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkout: CheckoutService) {}

  @Post('init')
  @HttpCode(HttpStatus.OK)
  async init(@Body() dto: CheckoutInitDto, @Headers('idempotency-key') idempotencyKey?: string) {
    const result = await this.checkout.initCheckout(dto, idempotencyKey);
    return { ok: true, ...result };
  }
}

