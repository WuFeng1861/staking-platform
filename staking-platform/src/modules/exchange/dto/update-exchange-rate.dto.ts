import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateExchangeRateDto {
  @IsOptional()
  @IsString({ message: '兑换比例必须是字符串' })
  exchangeRate?: string;

  @IsOptional()
  @IsBoolean({ message: '是否启用必须是布尔值' })
  isActive?: boolean;
}