import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller.js';
import { WhatsappPreviewController } from './preview.controller.js';
import { IntentService } from './intent.service.js';
import { CatalogModule } from '../catalog/catalog.module.js';
import { WhatsappSenderService } from './sender.service.js';
import { CartModule } from '../cart/cart.module.js';

@Module({
  imports: [CatalogModule, CartModule],
  controllers: [WhatsappController, WhatsappPreviewController],
  providers: [IntentService, WhatsappSenderService],
})
export class WhatsappModule {}
