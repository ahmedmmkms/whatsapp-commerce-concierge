import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { TemplatesController } from './templates.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [TemplatesController],
})
export class CmsModule {}

