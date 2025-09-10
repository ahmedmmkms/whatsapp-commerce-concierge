import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CacheService } from '../cache/cache.service.js';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService, private cache: CacheService) {}

  private defaultCurrency() {
    return process.env.DEFAULT_CURRENCY || 'USD';
  }

  private async ensureContext(waPhone?: string) {
    // Bind cart to real WA sender when provided; fallback to preview when absent
    const phone = waPhone || 'preview';
    let customer = await this.prisma.customer.findUnique({ where: { waPhone } });
    if (!customer) {
      customer = await this.prisma.customer.create({ data: { waPhone: phone, waName: waPhone ? undefined : 'Preview' } });
    }
    let convo = await this.prisma.conversation.findUnique({ where: { customerId: customer.id } });
    if (!convo) {
      convo = await this.prisma.conversation.create({ data: { customerId: customer.id } });
    }
    return { customer, conversation: convo };
  }

  async createOrGetCart(waPhone?: string) {
    const { customer, conversation } = await this.ensureContext(waPhone);
    let cart = await this.prisma.cart.findFirst({
      where: { customerId: customer.id, status: 'active' },
      include: { items: true },
    });
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          customerId: customer.id,
          conversationId: conversation.id,
          currency: this.defaultCurrency(),
        },
        include: { items: true },
      });
    }
    return cart;
  }

  async getCart(waPhone?: string) {
    const { customer } = await this.ensureContext(waPhone);
    const cart = await this.prisma.cart.findFirst({
      where: { customerId: customer.id, status: 'active' },
      include: { items: true },
    });
    if (!cart) return await this.createOrGetCart(waPhone);
    return cart;
  }

  private computeTotals(items: { qty: number; lineTotalMinor: number }[]) {
    const subtotal = items.reduce((s, it) => s + (it.lineTotalMinor || 0), 0);
    const tax = 0;
    const shipping = 0;
    const total = subtotal + tax + shipping;
    return { subtotal, tax, shipping, total };
  }

  private async resolveProduct(dto: { productId?: string; sku?: string }): Promise<Product> {
    const { productId, sku } = dto;
    if (!productId && !sku) throw new NotFoundException('productId or sku required');
    let product: Product | null = null;
    if (productId) product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product && sku) product = await this.prisma.product.findUnique({ where: { sku } });
    if (!product) throw new NotFoundException('product not found');
    return product;
  }

  async addItem(dto: { productId?: string; sku?: string; qty: number }, idempotencyKey?: string, waPhone?: string) {
    const cart = await this.createOrGetCart(waPhone);

    // Check idempotency cache
    if (idempotencyKey && this.cache.isEnabled()) {
      const cached = await this.cache.get<string>(`idem:cart:${cart.id}:${idempotencyKey}`);
      if (cached) {
        const item = await this.prisma.cartItem.findUnique({ where: { id: cached } });
        if (item) return item;
      }
    }

    const product = await this.resolveProduct(dto);

    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId: product.id } } });
      let item;
      if (existing) {
        item = await tx.cartItem.update({
          where: { id: existing.id },
          data: { qty: existing.qty + dto.qty, lineTotalMinor: (existing.qty + dto.qty) * existing.priceSnapshotMinor },
        });
      } else {
        item = await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId: product.id,
            sku: product.sku,
            nameSnapshot: product.name,
            priceSnapshotMinor: product.price,
            currency: product.currency,
            qty: dto.qty,
            lineTotalMinor: dto.qty * product.price,
          },
        });
      }
      const items = await tx.cartItem.findMany({ where: { cartId: cart.id } });
      const totals = this.computeTotals(items);
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          subtotalMinor: totals.subtotal,
          taxMinor: totals.tax,
          shippingMinor: totals.shipping,
          totalMinor: totals.total,
          version: { increment: 1 } as unknown as number | Prisma.IntFieldUpdateOperationsInput,
        },
      });
      return item;
    });

    if (idempotencyKey && this.cache.isEnabled()) {
      const ttl = parseInt(process.env.CART_IDEMPOTENCY_TTL_MIN || '15', 10) * 60;
      await this.cache.set(`idem:cart:${cart.id}:${idempotencyKey}`, result.id, ttl);
    }

    return result;
  }

  async updateItemQty(itemId: string, qty: number) {
    const cart = await this.createOrGetCart();
    await this.prisma.$transaction(async (tx) => {
      if (qty <= 0) {
        await tx.cartItem.delete({ where: { id: itemId } });
      } else {
        const item = await tx.cartItem.findUnique({ where: { id: itemId } });
        if (!item) throw new NotFoundException('item not found');
        await tx.cartItem.update({ where: { id: itemId }, data: { qty, lineTotalMinor: qty * item.priceSnapshotMinor } });
      }
      const items = await tx.cartItem.findMany({ where: { cartId: cart.id } });
      const totals = this.computeTotals(items);
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          subtotalMinor: totals.subtotal,
          taxMinor: totals.tax,
          shippingMinor: totals.shipping,
          totalMinor: totals.total,
          version: { increment: 1 } as unknown as number | Prisma.IntFieldUpdateOperationsInput,
        },
      });
    });
    // return refreshed item or null if deleted
    return await this.prisma.cartItem.findUnique({ where: { id: itemId } });
  }

  async removeItem(itemId: string) {
    const cart = await this.createOrGetCart();
    await this.prisma.$transaction(async (tx) => {
      await tx.cartItem.delete({ where: { id: itemId } });
      const items = await tx.cartItem.findMany({ where: { cartId: cart.id } });
      const totals = this.computeTotals(items);
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          subtotalMinor: totals.subtotal,
          taxMinor: totals.tax,
          shippingMinor: totals.shipping,
          totalMinor: totals.total,
          version: { increment: 1 } as unknown as number | Prisma.IntFieldUpdateOperationsInput,
        },
      });
    });
  }

  async estimateShipping(waPhone?: string) {
    const cart = await this.getCart(waPhone);
    const subtotal = cart.subtotalMinor || 0;
    // Simple stub: free shipping over 100 (in major units)
    const freeThreshold = 100 * 100;
    const shippingMinor = subtotal >= freeThreshold ? 0 : 20 * 100;
    return { currency: cart.currency || this.defaultCurrency(), shippingMinor, freeThresholdMinor: freeThreshold };
  }

  async updateItemQtyBySku(waPhone: string | undefined, sku: string, qty: number) {
    const cart = await this.createOrGetCart(waPhone);
    await this.prisma.$transaction(async (tx) => {
      const item = await tx.cartItem.findFirst({ where: { cartId: cart.id, sku } });
      if (!item) throw new NotFoundException('item not found');
      if (qty <= 0) {
        await tx.cartItem.delete({ where: { id: item.id } });
      } else {
        await tx.cartItem.update({ where: { id: item.id }, data: { qty, lineTotalMinor: qty * item.priceSnapshotMinor } });
      }
      const items = await tx.cartItem.findMany({ where: { cartId: cart.id } });
      const totals = this.computeTotals(items);
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          subtotalMinor: totals.subtotal,
          taxMinor: totals.tax,
          shippingMinor: totals.shipping,
          totalMinor: totals.total,
          version: { increment: 1 } as unknown as number | Prisma.IntFieldUpdateOperationsInput,
        },
      });
    });
    return this.getCart(waPhone);
  }

  async removeItemBySku(waPhone: string | undefined, sku: string) {
    return this.updateItemQtyBySku(waPhone, sku, 0);
  }
}
