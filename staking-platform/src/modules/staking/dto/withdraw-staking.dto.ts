import { IsNotEmpty, IsString, IsNumber, IsDateString } from 'class-validator';

export class WithdrawStakingDto {
  @IsNotEmpty()
  @IsNumber()
  stakingRecordId: number;

  @IsNotEmpty()
  @IsNumber()
  chainId: number;

  @IsNotEmpty()
  @IsString()
  withdrawHash: string;

  @IsNotEmpty()
  @IsString()
  stakingAddress: string;

  @IsNotEmpty()
  @IsString()
  withdrawCoin: string;

  @IsNotEmpty()
  @IsNumber()
  stakingApy: number;

  @IsNotEmpty()
  @IsDateString()
  stakingStartTime: string;

  @IsNotEmpty()
  @IsNumber()
  stakingLockDuration: number;

  @IsNotEmpty()
  @IsDateString()
  withdrawTime: string;
}