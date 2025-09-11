import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateTemplateDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  body?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  variables?: Record<string, unknown>;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  updatedBy?: string;
}

