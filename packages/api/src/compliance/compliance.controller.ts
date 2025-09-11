import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminTokenGuard } from '../common/admin-token.guard.js';
import { ComplianceService } from './compliance.service.js';

class PdplExportRequestDto {
  phone?: string;
  customerId?: string;
}

@ApiTags('Compliance')
@Controller('/compliance/pdpl')
export class ComplianceController {
  constructor(private svc: ComplianceService) {}

  @Get('/status')
  @ApiResponse({ status: 200, description: 'PDPL capability status' })
  async status() {
    return this.svc.getStatus();
  }

  @Post('/export')
  @UseGuards(AdminTokenGuard)
  @ApiBody({ type: PdplExportRequestDto })
  @ApiResponse({ status: 200, description: 'PDPL export JSON (inline for MVP)' })
  async export(@Body() body: PdplExportRequestDto) {
    return this.svc.exportByCustomer({ phone: body.phone, customerId: body.customerId });
  }

  @Post('/delete')
  @UseGuards(AdminTokenGuard)
  @HttpCode(202)
  @ApiBody({ type: PdplExportRequestDto })
  @ApiResponse({ status: 202, description: 'PDPL delete scheduled (stub)' })
  async requestDelete(_body: PdplExportRequestDto) {
    return this.svc.scheduleDelete();
  }
}

