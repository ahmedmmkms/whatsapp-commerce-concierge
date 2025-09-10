import { Body, Controller, Delete, Get, Headers, Param, Patch, Post } from '@nestjs/common';
import { CartService } from './cart.service.js';
import { AddCartItemDto } from './dto/add-cart-item.dto.js';
import { UpdateCartItemDto } from './dto/update-cart-item.dto.js';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  async createOrGet() {
    const cart = await this.cartService.createOrGetCart();
    return { ok: true, cart };
  }

  @Get()
  async get() {
    const cart = await this.cartService.getCart();
    return { ok: true, cart };
  }

  @Post('items')
  async addItem(@Body() dto: AddCartItemDto, @Headers('idempotency-key') idempotencyKey?: string) {
    const item = await this.cartService.addItem(dto, idempotencyKey);
    return { ok: true, item };
  }

  @Patch('items/:itemId')
  async updateItem(@Param('itemId') itemId: string, @Body() dto: UpdateCartItemDto) {
    const item = await this.cartService.updateItemQty(itemId, dto.qty);
    return { ok: true, item };
  }

  @Delete('items/:itemId')
  async deleteItem(@Param('itemId') itemId: string) {
    await this.cartService.removeItem(itemId);
    return { ok: true };
  }

  @Get('estimate-shipping')
  async estimate() {
    const estimate = await this.cartService.estimateShipping();
    return { ok: true, estimate };
  }
}
