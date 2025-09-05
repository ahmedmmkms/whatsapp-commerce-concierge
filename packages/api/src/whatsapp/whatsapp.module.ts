import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller.js';

@Module({
  controllers: [WhatsappController],
})
export class WhatsappModule {}

