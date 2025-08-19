import { Injectable, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import BigNumber from 'bignumber.js';
import { StakingRecord } from '../entities/staking-record.entity';
import { CreateStakingDto } from '../dto/create-staking.dto';
import { ExchangeService } from '../../exchange/services/exchange.service';
import { RewardService } from '../../reward/services/reward.service';
import { ReferralService } from '../../referral/services/referral.service';
import { RewardType } from '../../reward/entities/reward-record.entity';

@Injectable()
export class StakingService {
  constructor(
    @InjectRepository(StakingRecord)
    private readonly stakingRecordRepository: Repository<StakingRecord>,
    private readonly exchangeService: ExchangeService,
    @Inject(forwardRef(() => RewardService))
    private readonly rewardService: RewardService,
    private readonly referralService: ReferralService,
  ) {}

  /**
   * 进行质押
   */
  async createStaking(createStakingDto: CreateStakingDto): Promise<{ success: boolean; message: string; data?: any }> {
    // 检查质押哈希是否已存在
    const existingStaking = await this.stakingRecordRepository.findOne({
      where: { stakingHash: createStakingDto.stakingHash }
    });

    if (existingStaking) {
      throw new ConflictException('该质押交易哈希已存在');
    }

    try {
      // 1. 创建质押记录
      const stakingRecord = this.stakingRecordRepository.create({
        ...createStakingDto,
        stakingStartTime: new Date(createStakingDto.stakingStartTime),
      });

      // 2. 计算质押金额对应的USDT价值
      let usdtValue = '0';
      try {
        if (createStakingDto.stakingCoin.toUpperCase() === 'USDT') {
          usdtValue = createStakingDto.stakingAmount;
        } else {
          // 获取质押币种到USDT的兑换比例
          const exchangeRate = await this.exchangeService.getExchangeRate(
            createStakingDto.stakingCoin.toUpperCase(),
            'USDT'
          );
          const stakingAmountBN = new BigNumber(createStakingDto.stakingAmount);
          const exchangeRateBN = new BigNumber(exchangeRate.exchangeRate);
          usdtValue = stakingAmountBN.multipliedBy(exchangeRateBN).toString();
        }
      } catch (error) {
        // 如果没有找到兑换比例，默认为0
        console.warn(`未找到 ${createStakingDto.stakingCoin} 到 USDT 的兑换比例`);
      }

      // 3. 计算10%U价值的NexaFi奖励
      const usdtValueBN = new BigNumber(usdtValue);
      const rewardUsdtAmount = usdtValueBN.multipliedBy(0.1).toString();
      let nexafiRewardAmount = '0';
      
      try {
        const nexafiExchange = await this.exchangeService.calculateExchange('USDT', 'NexaFi', rewardUsdtAmount);
        nexafiRewardAmount = nexafiExchange.toAmount;
        stakingRecord.nexafiRewardAmount = nexafiRewardAmount;
      } catch (error) {
        console.warn('计算NexaFi奖励失败:', error.message);
      }

      // 4. 保存质押记录
      const savedStaking = await this.stakingRecordRepository.save(stakingRecord);

      // 5. 创建质押奖励记录
      if (parseFloat(nexafiRewardAmount) > 0) {
        try {
          await this.rewardService.createRewardRecord({
            chainId: createStakingDto.chainId,
            claimHash: createStakingDto.stakingHash,
            rewardToken: 'NexaFi',
            rewardTime: createStakingDto.stakingStartTime,
            stakingApy: createStakingDto.stakingApy,
            rewardAmount: nexafiRewardAmount,
            claimAddress: createStakingDto.stakingAddress,
            rewardType: RewardType.STAKING
          });
        } catch (error) {
          console.warn('创建质押奖励记录失败:', error.message);
        }
      }

      // 6. 处理推荐人奖励
      await this.handleReferralReward(createStakingDto, usdtValue, savedStaking);

      return {
        success: true,
        message: '质押成功',
        data: {
          stakingRecord: savedStaking,
          nexafiReward: nexafiRewardAmount,
          usdtValue: usdtValue
        }
      };

    } catch (error) {
      console.error('质押处理失败:', error);
      throw error;
    }
  }

  /**
   * 处理推荐人奖励
   */
  private async handleReferralReward(
    createStakingDto: CreateStakingDto,
    usdtValue: string,
    stakingRecord: StakingRecord
  ): Promise<void> {
    try {
      // 检查质押金额是否超过100U
      const usdtValueBN = new BigNumber(usdtValue);
      const minThresholdBN = new BigNumber(100);
      
      if (usdtValueBN.isLessThan(minThresholdBN)) {
        return;
      }

      // 检查是否有推荐人
      const referral = await this.referralService.getReferralByAddress(
        createStakingDto.stakingAddress,
        createStakingDto.chainId
      );

      if (!referral) {
        return;
      }

      // 检查是否是该地址在当前链的第一次质押（通过检查是否已发放过推荐奖励）
      const hasReferralReward = await this.stakingRecordRepository.findOne({
        where: {
          stakingAddress: createStakingDto.stakingAddress,
          chainId: createStakingDto.chainId,
          referralRewardGiven: true
        }
      });

      if (hasReferralReward) {
        return; // 已经发放过推荐奖励，不是第一次质押
      }

      // 计算20U对应的NexaFi奖励
      const referralRewardUsdt = '20';
      const nexafiExchange = await this.exchangeService.calculateExchange('USDT', 'NexaFi', referralRewardUsdt);
      const referralNexafiAmount = nexafiExchange.toAmount;

      // 创建推荐人奖励记录
      await this.rewardService.createRewardRecord({
        chainId: createStakingDto.chainId,
        claimHash: createStakingDto.stakingHash,
        rewardToken: 'NexaFi',
        rewardTime: createStakingDto.stakingStartTime,
        stakingApy: createStakingDto.stakingApy,
        rewardAmount: referralNexafiAmount,
        claimAddress: referral.referrerAddress,
        rewardType: RewardType.REFERRAL
      });

      // 标记已发放推荐奖励
      stakingRecord.referralRewardGiven = true;
      await this.stakingRecordRepository.save(stakingRecord);

    } catch (error) {
      console.warn('处理推荐人奖励失败:', error.message);
    }
  }

  /**
   * 根据地址查询质押记录
   */
  async getStakingsByAddress(stakingAddress: string, chainId?: number): Promise<StakingRecord[]> {
    const where: any = { stakingAddress };
    if (chainId) {
      where.chainId = chainId;
    }

    return await this.stakingRecordRepository.find({
      where,
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * 根据ID获取质押记录
   */
  async getStakingById(id: number): Promise<StakingRecord> {
    return await this.stakingRecordRepository.findOne({ where: { id } });
  }
}