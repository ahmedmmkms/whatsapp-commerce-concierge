import { Body, Controller, HttpCode, HttpStatus, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { IntentService, type Lang } from './intent.service.js';

class PreviewDto {
  from?: string;
  text!: string;
  lang?: Lang;
}

@Controller('/whatsapp/preview')
export class WhatsappPreviewController {
  constructor(private readonly intents: IntentService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async preview(@Body() dto: any, @Query('text') textQ?: string, @Query('lang') langQ?: string, @Req() req?: Request) {
    const textBody = typeof dto === 'string' ? dto : dto?.text;
    const text = (textBody ?? textQ ?? '').toString();
    const rawLang = (typeof dto === 'object' ? dto?.lang : undefined) ?? langQ;
    const lang: Lang = rawLang === 'ar' ? 'ar' : 'en';
    const from = (typeof dto === 'object' ? dto?.from : undefined) || undefined;
    const messages = await this.intents.handleText(text, lang, from);
    return { ok: true, messages };
  }
}
