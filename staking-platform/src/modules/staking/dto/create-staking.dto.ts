import { IsNotEmpty, IsString, IsNumber, IsDateString, Min, IsDecimal } from 'class-validator';

export class CreateStakingDto {
  @IsNotEmpty({ message: '交易hash不能为空' })
  @IsString({ message: '交易hash必须是字符串' })
  transactionHash: string;

  @IsNotEmpty({ message: '质押币种不能为空' })
  @IsString({ message: '质押币种必须是字符串' })
  stakingCoin: string;

  @IsNotEmpty({ message: '质押数量不能为空' })
  @IsDecimal({}, { message: '质押数量必须是有效的数字' })
  stakingAmount: string;

  @IsNotEmpty({ message: '质押起始时间不能为空' })
  @IsDateString({}, { message: '质押起始时间必须是有效的日期字符串' })
  stakingStartTime: string;

  @IsNotEmpty({ message: '质押最短时间不能为空' })
  @IsNumber({}, { message: '质押最短时间必须是数字' })
  @Min(0, { message: '质押最短时间不能小于0' })
  stakingMinDuration: number;

  @IsNotEmpty({ message: '质押年化不能为空' })
  @IsDecimal({}, { message: '质押年化必须是有效的数字' })
  stakingApr: string;

  @IsNotEmpty({ message: '质押地址不能为空' })
  @IsString({ message: '质押地址必须是字符串' })
  stakingAddress: string;

  @IsNotEmpty({ message: '质押链不能为空' })
  @IsString({ message: '质押链必须是字符串' })
  stakingChain: string;
}