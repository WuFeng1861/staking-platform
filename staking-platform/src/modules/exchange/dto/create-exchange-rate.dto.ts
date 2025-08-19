import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateExchangeRateDto {
  @IsNotEmpty({ message: '源币种不能为空' })
  @IsString({ message: '源币种必须是字符串' })
  fromToken: string;

  @IsNotEmpty({ message: '目标币种不能为空' })
  @IsString({ message: '目标币种必须是字符串' })
  toToken: string;

  @IsNotEmpty({ message: '兑换比例不能为空' })
  @IsString({ message: '兑换比例必须是字符串' })
  exchangeRate: string;

  @IsOptional()
  @IsBoolean({ message: '是否启用必须是布尔值' })
  isActive?: boolean = true;
}