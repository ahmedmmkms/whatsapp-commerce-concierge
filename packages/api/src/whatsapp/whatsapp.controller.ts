import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller('/webhook/whatsapp')
export class WhatsappController {
  @Get()
  verify(@Query('hub.mode') mode: string, @Query('hub.verify_token') token: string, @Query('hub.challenge') challenge: string, @Res() res: Response) {
    const expected = process.env.WHATSAPP_VERIFY_TOKEN || 'changeme';
    if (mode === 'subscribe' && token === expected) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('forbidden');
  }

  @Post()
  receive(@Req() req: Request) {
    // Minimal ACK; log payload for now
    return { status: 'received', ts: Date.now() };
  }
}

