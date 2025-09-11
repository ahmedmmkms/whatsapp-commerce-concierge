import { Module } from '@nestjs/common';
import { ComplianceController } from './compliance.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ComplianceService } from './compliance.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [ComplianceController],
  providers: [ComplianceService],
})
export class ComplianceModule {}

