import { IsNotEmpty, IsString, IsNumber, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateStakingDto {
  @IsNotEmpty({ message: '链ID不能为空' })
  @IsNumber({}, { message: '链ID必须是数字' })
  @Transform(({ value }) => parseInt(value))
  chainId: number;

  @IsNotEmpty({ message: '质押币种不能为空' })
  @IsString({ message: '质押币种必须是字符串' })
  stakingCoin: string;

  @IsNotEmpty({ message: '质押交易哈希不能为空' })
  @IsString({ message: '质押交易哈希必须是字符串' })
  stakingHash: string;

  @IsNotEmpty({ message: '质押数量不能为空' })
  @IsString({ message: '质押数量必须是字符串' })
  stakingAmount: string;

  @IsNotEmpty({ message: '质押起始时间不能为空' })
  @IsDateString({}, { message: '质押起始时间格式不正确' })
  stakingStartTime: string;

  @IsNotEmpty({ message: '质押锁仓时间不能为空' })
  @IsNumber({}, { message: '质押锁仓时间必须是数字' })
  @Transform(({ value }) => parseInt(value))
  stakingLockDuration: number;

  @IsNotEmpty({ message: '质押年化率不能为空' })
  @IsNumber({}, { message: '质押年化率必须是数字' })
  @Transform(({ value }) => parseFloat(value))
  stakingApy: number;

  @IsNotEmpty({ message: '质押地址不能为空' })
  @IsString({ message: '质押地址必须是字符串' })
  stakingAddress: string;
}