import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateReturnDto {
  @IsUUID()
  @IsNotEmpty()
  orderId!: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

