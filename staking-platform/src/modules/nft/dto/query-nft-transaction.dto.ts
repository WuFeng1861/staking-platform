import { IsString, IsOptional, IsNumberString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryNftTransactionDto {
  @IsString()
  address: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minId?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  pageSize?: number = 10;
}