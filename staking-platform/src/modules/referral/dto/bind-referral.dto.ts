import { IsNotEmpty, IsString } from 'class-validator';

export class BindReferralDto {
  @IsNotEmpty({ message: '当前地址不能为空' })
  @IsString({ message: '当前地址必须是字符串' })
  currentAddress: string;

  @IsNotEmpty({ message: '上级地址不能为空' })
  @IsString({ message: '上级地址必须是字符串' })
  referrerAddress: string;

  @IsNotEmpty({ message: '链ID不能为空' })
  @IsString({ message: '链ID必须是字符串' })
  chainId: string;

  @IsNotEmpty({ message: '链名称不能为空' })
  @IsString({ message: '链名称必须是字符串' })
  chainName: string;

  @IsNotEmpty({ message: '交易hash不能为空' })
  @IsString({ message: '交易hash必须是字符串' })
  transactionHash: string;
}