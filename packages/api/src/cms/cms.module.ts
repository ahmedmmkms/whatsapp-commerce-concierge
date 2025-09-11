import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { TemplatesController } from './templates.controller.js';
import { TemplateService } from './template.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [TemplatesController],
  providers: [TemplateService],
  exports: [TemplateService],
})
export class CmsModule {}
