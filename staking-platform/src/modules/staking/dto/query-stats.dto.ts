import { IsEnum, IsOptional } from 'class-validator';

export enum TimeRange {
  HOUR_1 = '1h',
  DAY_1 = '1d',
  DAY_3 = '3d',
  WEEK_1 = '1w',
}

export class QueryStatsDto {
  @IsOptional()
  @IsEnum(TimeRange, { message: '时间范围必须是有效的值：1h, 1d, 3d, 1w' })
  timeRange?: TimeRange = TimeRange.DAY_1;
}