import { Controller, Get, Post, Delete, Body, Param, Query, ValidationPipe, UsePipes } from '@nestjs/common';
import { RewardService } from '../services/reward.service';
import { CreateRewardRecordDto } from '../dto/create-reward-record.dto';
import { QueryRewardRecordDto } from '../dto/query-reward-record.dto';

@Controller('reward')
@UsePipes(new ValidationPipe({ transform: true }))
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  /**
   * 创建奖励记录
   */
  @Post()
  async createRewardRecord(@Body() createRewardRecordDto: CreateRewardRecordDto) {
    return await this.rewardService.createRewardRecord(createRewardRecordDto);
  }

  /**
   * 查询奖励记录列表
   */
  @Get()
  async getRewardRecords(@Query() queryDto: QueryRewardRecordDto) {
    return await this.rewardService.getRewardRecords(queryDto);
  }

  /**
   * 根据ID获取奖励记录详情
   */
  @Get(':id')
  async getRewardRecordById(@Param('id') id: string) {
    return await this.rewardService.getRewardRecordById(parseInt(id));
  }

  /**
   * 根据交易哈希获取奖励记录
   */
  @Get('hash/:claimHash')
  async getRewardRecordByHash(@Param('claimHash') claimHash: string) {
    return await this.rewardService.getRewardRecordByHash(claimHash);
  }

  /**
   * 获取用户奖励统计
   */
  @Get('stats/:claimAddress')
  async getUserRewardStats(
    @Param('claimAddress') claimAddress: string,
    @Query('chainId') chainId?: string
  ) {
    const chainIdNum = chainId ? parseInt(chainId) : undefined;
    return await this.rewardService.getUserRewardStats(claimAddress, chainIdNum);
  }

  /**
   * 删除奖励记录
   */
  @Delete(':id')
  async deleteRewardRecord(@Param('id') id: string) {
    await this.rewardService.deleteRewardRecord(parseInt(id));
    return { message: '奖励记录删除成功' };
  }
}