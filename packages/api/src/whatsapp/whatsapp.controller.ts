import { Controller, Get, Headers, HttpCode, HttpException, HttpStatus, Post, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { computeSignature, signaturesMatch } from './signature.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('/webhook/whatsapp')
export class WhatsappController {
  constructor(private readonly prisma: PrismaService) {}
  @Get()
  verify(@Query('hub.mode') mode: string, @Query('hub.verify_token') token: string, @Query('hub.challenge') challenge: string, @Res() res: Response) {
    const expected = process.env.WHATSAPP_VERIFY_TOKEN || 'changeme';
    if (mode === 'subscribe' && token === expected) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('forbidden');
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async receive(
    @Req() req: Request,
    @Headers('x-hub-signature-256') signature?: string,
  ) {
    // Verify signature when app secret is configured
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    if (appSecret) {
      if (!signature) {
        throw new HttpException('missing signature', HttpStatus.FORBIDDEN);
      }
      const expected = computeSignature(appSecret, (req as any).rawBody as Buffer);
      if (!signaturesMatch(expected, signature)) {
        throw new HttpException('invalid signature', HttpStatus.FORBIDDEN);
      }
    }

    // Minimal ingest: parse payload structure and acknowledge
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body: any = req.body;
    const entries = Array.isArray(body?.entry) ? body.entry : [];
    const messages: Array<{ from: string; id: string; text?: string }> = [];
    for (const e of entries) {
      const changes = Array.isArray(e?.changes) ? e.changes : [];
      for (const c of changes) {
        const value = c?.value;
        const msgs = Array.isArray(value?.messages) ? value.messages : [];
        for (const m of msgs) {
          messages.push({
            from: m?.from,
            id: m?.id,
            text: m?.text?.body,
          });
        }
      }
    }

    // Persist minimal entities: upsert customer and ensure a conversation record
    // Note: keep synchronous for Sprint 1; move to queue in later sprints
    for (const msg of messages) {
      if (!msg.from) continue;
      const customer = await this.prisma.customer.upsert({
        where: { waPhone: msg.from },
        update: { waName: undefined },
        create: { waPhone: msg.from },
      });
      await this.prisma.conversation.upsert({
        where: { customerId: customer.id },
        update: { lastMessageAt: new Date() },
        create: { customerId: customer.id, lastMessageAt: new Date() },
      });
    }

    // eslint-disable-next-line no-console
    console.log('[wa:webhook] messages', { count: messages.length });

    return { status: 'received', count: messages.length, ts: Date.now() };
  }

}
