import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString, Length } from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty()
  @IsString()
  @Length(1, 64)
  key!: string;

  @ApiProperty({ enum: ['ar', 'en'] })
  @IsString()
  @Length(2, 8)
  locale!: string;

  @ApiProperty({ enum: ['wa', 'web'] })
  @IsString()
  @Length(2, 8)
  channel!: string;

  @ApiProperty()
  @IsString()
  body!: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  variables?: Record<string, unknown>;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  updatedBy?: string;
}

