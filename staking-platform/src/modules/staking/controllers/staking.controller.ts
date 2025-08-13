import { Controller, Post, Body, Get, Query, UseInterceptors } from '@nestjs/common';
import { StakingService } from '../services/staking.service';
import { CreateStakingDto } from '../dto/create-staking.dto';
import { QueryStakingDto } from '../dto/query-staking.dto';
import { AdminAuthDto } from '../dto/admin-auth.dto';
import { QueryStatsDto } from '../dto/query-stats.dto';
import { TransformInterceptor } from '../../../common/interceptors/transform.interceptor';

@Controller('staking')
@UseInterceptors(TransformInterceptor)
export class StakingController {
  constructor(private readonly stakingService: StakingService) {}

  /**
   * 创建质押记录
   * @param createStakingDto 创建质押记录DTO
   */
  @Post()
  async createStaking(@Body() createStakingDto: CreateStakingDto) {
    return this.stakingService.createStaking(createStakingDto);
  }

  /**
   * 查询质押记录（分页）
   * 可以通过质押地址(stakingAddress)查询特定地址的质押记录
   * @param queryDto 查询参数，包含minId、pageSize和可选的stakingAddress
   */
  @Get()
  async queryStakingRecords(@Query() queryDto: QueryStakingDto) {
    return this.stakingService.queryStakingRecords(queryDto);
  }

  /**
   * 管理员查询所有质押总量
   * @param adminAuthDto 管理员认证DTO
   */
  @Post('admin/total')
  async queryTotalStaking(@Body() adminAuthDto: AdminAuthDto) {
    return this.stakingService.queryTotalStaking(adminAuthDto);
  }

  /**
   * 查询统计数据
   * @param queryDto 查询参数
   */
  @Get('stats')
  async queryStats(@Query() queryDto: QueryStatsDto) {
    return this.stakingService.queryStats(queryDto);
  }
}