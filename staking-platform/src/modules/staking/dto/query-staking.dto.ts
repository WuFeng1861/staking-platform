import { IsOptional, IsNumber, Min, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryStakingDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '最小ID必须是数字' })
  @Min(0, { message: '最小ID不能小于0' })
  minId?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '页大小必须是数字' })
  @Min(1, { message: '页大小不能小于1' })
  pageSize?: number = 10;
  
  @IsString({ message: '质押地址必须是字符串' })
  @IsNotEmpty({ message: '质押地址不能为空' })
  stakingAddress: string;
}