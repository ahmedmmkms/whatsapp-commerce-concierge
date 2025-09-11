import { Controller, Headers, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('/payments/stripe/webhook')
export class StripeController {
  private stripe?: Stripe;
  private webhookSecret?: string;

  constructor(private prisma: PrismaService) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key) this.stripe = new Stripe(key);
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  }

  @Post()
  async receive(@Req() req: Request & { rawBody?: Buffer }, @Res() res: Response, @Headers('stripe-signature') sig?: string) {
    try {
      if (!this.stripe || !this.webhookSecret) {
        return res.status(200).json({ ok: true, skipped: 'stripe not configured' });
      }
      if (!sig || !req.rawBody) {
        return res.status(400).json({ ok: false, error: 'missing signature/rawBody' });
      }
      const event = this.stripe.webhooks.constructEvent(req.rawBody, sig, this.webhookSecret);

      // Handle a subset of events relevant to Checkout
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = (session.metadata as any)?.orderId as string | undefined;
        if (orderId) {
          await this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({ where: { id: orderId } });
            if (!order) return;
            await tx.order.update({ where: { id: orderId }, data: { status: 'paid', paymentState: 'succeeded', externalPaymentId: session.payment_intent as string } });
            await tx.payment.updateMany({ where: { orderId, provider: 'stripe' }, data: { status: 'succeeded', intentId: session.id } });
            await tx.cart.updateMany({ where: { id: order.cartId ?? '' }, data: { status: 'ordered' } });
          });
        }
      } else if (event.type === 'checkout.session.expired' || event.type === 'payment_intent.canceled') {
        const obj = event.data.object as any;
        const orderId = obj?.metadata?.orderId as string | undefined;
        if (orderId) {
          await this.prisma.order.update({ where: { id: orderId }, data: { status: 'canceled', paymentState: 'canceled' } }).catch(() => void 0);
          await this.prisma.payment.updateMany({ where: { orderId, provider: 'stripe' }, data: { status: 'canceled' } }).catch(() => void 0);
        }
      }

      return res.status(200).json({ received: true });
    } catch (err: any) {
      return res.status(400).json({ error: err?.message || 'invalid payload' });
    }
  }
}
