import { IsString, IsNotEmpty, IsNumber, IsDateString, IsDecimal } from 'class-validator';

export class CreateNftTransactionDto {
  @IsString()
  @IsNotEmpty()
  transactionHash: string;

  @IsString()
  @IsNotEmpty()
  stakingCoin: string;

  @IsDecimal({ decimal_digits: '0,8' })
  @IsNotEmpty()
  stakingAmount: string;

  @IsDateString()
  @IsNotEmpty()
  stakingStartTime: string;

  @IsNumber()
  @IsNotEmpty()
  stakingMinDuration: number;

  @IsDecimal({ decimal_digits: '0,2' })
  @IsNotEmpty()
  stakingApr: string;

  @IsString()
  @IsNotEmpty()
  fromAddress: string;

  @IsString()
  @IsNotEmpty()
  toAddress: string;

  @IsString()
  @IsNotEmpty()
  stakingChain: string;
}