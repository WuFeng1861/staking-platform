import { Controller, Post, Get, Body, Param, Query, ValidationPipe, UsePipes, Put } from '@nestjs/common';
import { StakingService } from '../services/staking.service';
import { CreateStakingDto } from '../dto/create-staking.dto';
import { WithdrawStakingDto } from '../dto/withdraw-staking.dto';

@Controller('staking')
@UsePipes(new ValidationPipe({ transform: true }))
export class StakingController {
  constructor(private readonly stakingService: StakingService) {}

  /**
   * 进行质押
   */
  @Post()
  async createStaking(@Body() createStakingDto: CreateStakingDto) {
    return await this.stakingService.createStaking(createStakingDto);
  }

  /**
   * 根据地址查询质押记录
   */
  @Get('address/:stakingAddress')
  async getStakingsByAddress(
    @Param('stakingAddress') stakingAddress: string,
    @Query('chainId') chainId?: string
  ) {
    const chainIdNum = chainId ? parseInt(chainId) : undefined;
    return await this.stakingService.getStakingsByAddress(stakingAddress, chainIdNum);
  }

  /**
   * 根据ID获取质押记录详情
   */
  @Get(':id')
  async getStakingById(@Param('id') id: string) {
    return await this.stakingService.getStakingById(parseInt(id));
  }

  /**
   * 取回质押
   */
  @Put('withdraw')
  async withdrawStaking(@Body() withdrawStakingDto: WithdrawStakingDto) {
    return await this.stakingService.withdrawStaking(withdrawStakingDto);
  }
}
