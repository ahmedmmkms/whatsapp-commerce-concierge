import { Controller, Headers, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller('/payments/stripe/webhook')
export class StripeController {
  @Post()
  async receive(@Req() req: Request, @Res() res: Response, @Headers('stripe-signature') sig?: string) {
    // Placeholder: do not verify in Sprint 0; just log basic acknowledgement
    // In later sprints, use Stripe SDK to construct event with webhook secret
    res.status(200).json({ received: true, signature: !!sig });
  }
}

