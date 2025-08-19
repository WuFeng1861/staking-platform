import { IsNotEmpty, IsString, IsNumber, IsEnum, IsDateString, IsDecimal } from 'class-validator';
import { Transform } from 'class-transformer';
import { RewardType } from '../entities/reward-record.entity';

export class CreateRewardRecordDto {
  @IsNotEmpty({ message: '链ID不能为空' })
  @IsNumber({}, { message: '链ID必须是数字' })
  @Transform(({ value }) => parseInt(value))
  chainId: number;

  @IsNotEmpty({ message: '领取奖励交易哈希不能为空' })
  @IsString({ message: '领取奖励交易哈希必须是字符串' })
  claimHash: string;

  @IsNotEmpty({ message: '奖励币种不能为空' })
  @IsString({ message: '奖励币种必须是字符串' })
  rewardToken: string;

  @IsNotEmpty({ message: '领取奖励时间不能为空' })
  @IsDateString({}, { message: '领取奖励时间格式不正确' })
  rewardTime: string;

  @IsNotEmpty({ message: '质押年化率不能为空' })
  @IsNumber({}, { message: '质押年化率必须是数字' })
  @Transform(({ value }) => parseFloat(value))
  stakingApy: number;

  @IsNotEmpty({ message: '领取奖励数量不能为空' })
  @IsString({ message: '领取奖励数量必须是字符串' })
  rewardAmount: string;

  @IsNotEmpty({ message: '领取地址不能为空' })
  @IsString({ message: '领取地址必须是字符串' })
  claimAddress: string;

  @IsNotEmpty({ message: '奖励类型不能为空' })
  @IsEnum(RewardType, { message: '奖励类型必须是有效值' })
  rewardType: RewardType;
}