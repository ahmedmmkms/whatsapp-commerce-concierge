import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AddCartItemDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsInt()
  @Min(1)
  qty!: number;
}

