import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class QuerySubordinatesDto {
  @IsNotEmpty({ message: '地址不能为空' })
  @IsString({ message: '地址必须是字符串' })
  address: string;

  @IsOptional()
  @IsString({ message: '链ID必须是字符串' })
  chainId?: string; // 可选，如果不传则查询所有链
}