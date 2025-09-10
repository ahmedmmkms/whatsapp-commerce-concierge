import { Injectable, NotImplementedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async createOrGetCart() {
    throw new NotImplementedException('createOrGetCart not implemented');
  }

  async getCart() {
    throw new NotImplementedException('getCart not implemented');
  }

  async addItem(_dto: { productId?: string; sku?: string; qty: number }) {
    throw new NotImplementedException('addItem not implemented');
  }

  async updateItemQty(_itemId: string, _qty: number) {
    throw new NotImplementedException('updateItemQty not implemented');
  }

  async removeItem(_itemId: string) {
    throw new NotImplementedException('removeItem not implemented');
  }

  async estimateShipping() {
    throw new NotImplementedException('estimateShipping not implemented');
  }
}

