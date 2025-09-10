import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
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
  async preview(@Body() dto: PreviewDto) {
    const lang: Lang = dto.lang === 'ar' ? 'ar' : 'en';
    const messages = await this.intents.handleText(dto.text || '', lang);
    return { ok: true, messages };
  }
}
