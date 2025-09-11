import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReturnDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  orderId!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
