import { IsOptional, IsString, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { RewardType } from '../entities/reward-record.entity';

export class QueryRewardRecordDto {
  @IsOptional()
  @IsString({ message: '领取地址必须是字符串' })
  claimAddress?: string;

  @IsOptional()
  @IsNumber({}, { message: '链ID必须是数字' })
  @Transform(({ value }) => parseInt(value))
  chainId?: number;

  @IsOptional()
  @IsEnum(RewardType, { message: '奖励类型必须是有效值' })
  rewardType?: RewardType;

  @IsOptional()
  @IsString({ message: '奖励币种必须是字符串' })
  rewardToken?: string;

  @IsOptional()
  @IsDateString({}, { message: '开始时间格式不正确' })
  startTime?: string;

  @IsOptional()
  @IsDateString({}, { message: '结束时间格式不正确' })
  endTime?: string;

  @IsOptional()
  @IsNumber({}, { message: '页码必须是数字' })
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number = 1;

  @IsOptional()
  @IsNumber({}, { message: '每页数量必须是数字' })
  @Transform(({ value }) => parseInt(value) || 10)
  limit?: number = 10;
}