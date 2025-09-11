import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller.js';
import { WhatsappPreviewController } from './preview.controller.js';
import { IntentService } from './intent.service.js';
import { CatalogModule } from '../catalog/catalog.module.js';
import { WhatsappSenderService } from './sender.service.js';
import { CartModule } from '../cart/cart.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ReturnsModule } from '../returns/returns.module.js';
import { CmsModule } from '../cms/cms.module.js';

@Module({
  imports: [CatalogModule, CartModule, PrismaModule, ReturnsModule, CmsModule],
  controllers: [WhatsappController, WhatsappPreviewController],
  providers: [IntentService, WhatsappSenderService],
})
export class WhatsappModule {}
