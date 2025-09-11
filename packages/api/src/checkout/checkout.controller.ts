import { Body, Controller, Headers, HttpCode, HttpStatus, Post, HttpException } from '@nestjs/common';
import { CheckoutService } from './checkout.service.js';
import { CheckoutInitDto } from './dto/checkout-init.dto.js';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkout: CheckoutService) {}

  @Post('init')
  @HttpCode(HttpStatus.OK)
  async init(@Body() dto: CheckoutInitDto, @Headers('idempotency-key') idempotencyKey?: string) {
    try {
      const result = await this.checkout.initCheckout(dto, idempotencyKey);
      return { ok: true, ...result };
    } catch (err: any) {
      const code = err?.code as string | undefined;
      const hint = code === 'P2021' || /relation|table|does not exist/i.test(String(err?.message))
        ? 'Database schema not up-to-date. Apply Sprint 5 Prisma migrations.'
        : undefined;
      const message = `checkout-init-failed: ${err?.message || err}`;
      throw new HttpException({ ok: false, error: message, hint }, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
