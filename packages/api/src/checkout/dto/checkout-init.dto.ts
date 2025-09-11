import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentMethod {
  COD = 'cod',
  STRIPE = 'stripe',
}

export class AddressDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsNotEmpty() @IsString() line1!: string;
  @IsOptional() @IsString() line2?: string;
  @IsNotEmpty() @IsString() city!: string;
  @IsOptional() @IsString() region?: string;
  @IsNotEmpty() @IsString() country!: string; // ISO2
  @IsOptional() @IsString() postalCode?: string;
}

export class CheckoutInitDto {
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}

