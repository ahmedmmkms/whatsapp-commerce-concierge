import { Body, Controller, Post } from '@nestjs/common';
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
  async preview(@Body() dto: PreviewDto) {
    const lang: Lang = dto.lang === 'ar' ? 'ar' : 'en';
    const messages = await this.intents.handleText(dto.text || '', lang);
    return { ok: true, messages };
  }
}

