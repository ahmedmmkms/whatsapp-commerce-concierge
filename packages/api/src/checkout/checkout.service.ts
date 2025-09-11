import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service.js';
import { CartService } from '../cart/cart.service.js';
import { CheckoutInitDto, PaymentMethod } from './dto/checkout-init.dto.js';

@Injectable()
export class CheckoutService {
  private stripe?: Stripe;

  constructor(private prisma: PrismaService, private carts: CartService) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key) {
      this.stripe = new Stripe(key);
    }
  }

  private async ensureAddress(address?: CheckoutInitDto['address']) {
    if (!address) return undefined;
    const created = await this.prisma.address.create({
      data: {
        name: address.name,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        region: address.region,
        country: address.country,
        postalCode: address.postalCode,
      },
    });
    return created.id;
  }

  async initCheckout(dto: CheckoutInitDto, idempotencyKey?: string) {
    // Create order from active cart for preview user (or WA-bound when integrated)
    const cart = await this.carts.getCart();
    const addressId = await this.ensureAddress(dto.address);

    // Reuse existing pending order for this cart if present (idempotency light)
    let order = await this.prisma.order.findFirst({ where: { cartId: cart.id, status: { in: ['pending', 'pending_cod'] } } });

    if (!order) {
      order = await this.prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            customerId: cart.customerId,
            conversationId: cart.conversationId,
            cartId: cart.id,
            addressId,
            currency: cart.currency,
            subtotalMinor: cart.subtotalMinor,
            taxMinor: cart.taxMinor,
            shippingMinor: cart.shippingMinor,
            totalMinor: cart.totalMinor,
            status: dto.method === PaymentMethod.COD ? 'pending_cod' : 'pending',
          },
        });
        const items = await tx.cartItem.findMany({ where: { cartId: cart.id } });
        for (const it of items) {
          await tx.orderItem.create({
            data: {
              orderId: created.id,
              productId: it.productId,
              sku: it.sku,
              nameSnapshot: it.nameSnapshot,
              priceSnapshotMinor: it.priceSnapshotMinor,
              currency: it.currency,
              qty: it.qty,
              lineTotalMinor: it.lineTotalMinor,
            },
          });
        }
        return created;
      });
    }

    if (dto.method === PaymentMethod.COD) {
      // Create a Payment record in pending state for traceability
      const existing = await this.prisma.payment.findFirst({ where: { orderId: order!.id, provider: 'cod' } });
      if (!existing) {
        await this.prisma.payment.create({ data: { orderId: order!.id, provider: 'cod', status: 'pending', amountMinor: order!.totalMinor, currency: order!.currency } });
      }
      return { method: 'cod', orderId: order!.id, totalMinor: order!.totalMinor, currency: order!.currency };
    }

    // Stripe flow
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    // If an existing stripe session/intent exists, reuse URL when possible
    const payment = await this.prisma.payment.findFirst({ where: { orderId: order!.id, provider: 'stripe' } });
    if (payment?.intentId) {
      // We cannot reconstruct session URL reliably; proceed to create a new session.
    }

    const successUrl = process.env.CHECKOUT_SUCCESS_URL || 'https://example.com/success?orderId={ORDER_ID}';
    const cancelUrl = process.env.CHECKOUT_CANCEL_URL || 'https://example.com/cancel?orderId={ORDER_ID}';

    const lineItems = await this.prisma.orderItem.findMany({ where: { orderId: order!.id } });
    const session = await this.stripe.checkout.sessions.create(
      {
        mode: 'payment',
        success_url: successUrl.replace('{ORDER_ID}', order!.id),
        cancel_url: cancelUrl.replace('{ORDER_ID}', order!.id),
        metadata: { orderId: order!.id },
        line_items: lineItems.map((li) => ({
          quantity: li.qty,
          price_data: {
            currency: li.currency.toLowerCase(),
            unit_amount: li.priceSnapshotMinor,
            product_data: { name: li.nameSnapshot },
          },
        })),
      },
      idempotencyKey ? { idempotencyKey } : undefined,
    );

    await this.prisma.payment.upsert({
      where: { intentId: session.id },
      update: { status: 'processing' },
      create: { orderId: order!.id, provider: 'stripe', intentId: session.id, status: 'processing', amountMinor: order!.totalMinor, currency: order!.currency },
    });

    return { method: 'stripe', orderId: order!.id, checkoutUrl: session.url };
  }
}
