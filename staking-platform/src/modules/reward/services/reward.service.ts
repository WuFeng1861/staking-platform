import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { RewardRecord } from '../entities/reward-record.entity';
import { CreateRewardRecordDto } from '../dto/create-reward-record.dto';
import { QueryRewardRecordDto } from '../dto/query-reward-record.dto';

@Injectable()
export class RewardService {
  constructor(
    @InjectRepository(RewardRecord)
    private readonly rewardRecordRepository: Repository<RewardRecord>,
  ) {}

  /**
   * 创建奖励记录
   */
  async createRewardRecord(createRewardRecordDto: CreateRewardRecordDto): Promise<RewardRecord> {
    // 检查交易哈希+奖励类型+奖励地址的组合是否已存在
    const existingRecord = await this.rewardRecordRepository.findOne({
      where: { 
        claimHash: createRewardRecordDto.claimHash,
        rewardType: createRewardRecordDto.rewardType,
        claimAddress: createRewardRecordDto.claimAddress
      }
    });

    if (existingRecord) {
      throw new ConflictException('该交易哈希、奖励类型和地址的组合记录已存在');
    }

    const rewardRecord = this.rewardRecordRepository.create({
      ...createRewardRecordDto,
      rewardTime: new Date(createRewardRecordDto.rewardTime),
    });

    return await this.rewardRecordRepository.save(rewardRecord);
  }

  /**
   * 查询奖励记录列表
   */
  async getRewardRecords(queryDto: QueryRewardRecordDto) {
    const { page = 1, limit = 10, claimAddress, chainId, rewardType, rewardToken, startTime, endTime } = queryDto;
    
    const queryBuilder = this.rewardRecordRepository.createQueryBuilder('reward');

    // 添加查询条件
    if (claimAddress) {
      queryBuilder.andWhere('reward.claimAddress = :claimAddress', { claimAddress });
    }

    if (chainId) {
      queryBuilder.andWhere('reward.chainId = :chainId', { chainId });
    }

    if (rewardType) {
      queryBuilder.andWhere('reward.rewardType = :rewardType', { rewardType });
    }

    if (rewardToken) {
      queryBuilder.andWhere('reward.rewardToken = :rewardToken', { rewardToken });
    }

    if (startTime && endTime) {
      queryBuilder.andWhere('reward.rewardTime BETWEEN :startTime AND :endTime', {
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      });
    } else if (startTime) {
      queryBuilder.andWhere('reward.rewardTime >= :startTime', { startTime: new Date(startTime) });
    } else if (endTime) {
      queryBuilder.andWhere('reward.rewardTime <= :endTime', { endTime: new Date(endTime) });
    }

    // 分页和排序
    const offset = (page - 1) * limit;
    queryBuilder
      .orderBy('reward.rewardTime', 'DESC')
      .skip(offset)
      .take(limit);

    const [records, total] = await queryBuilder.getManyAndCount();

    return {
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 根据ID获取奖励记录详情
   */
  async getRewardRecordById(id: number): Promise<RewardRecord> {
    const record = await this.rewardRecordRepository.findOne({ where: { id } });
    
    if (!record) {
      throw new NotFoundException('奖励记录不存在');
    }

    return record;
  }

  /**
   * 根据交易哈希获取奖励记录
   */
  async getRewardRecordByHash(claimHash: string): Promise<RewardRecord> {
    const record = await this.rewardRecordRepository.findOne({ where: { claimHash } });
    
    if (!record) {
      throw new NotFoundException('奖励记录不存在');
    }

    return record;
  }

  /**
   * 获取用户奖励统计
   */
  async getUserRewardStats(claimAddress: string, chainId?: number) {
    const queryBuilder = this.rewardRecordRepository.createQueryBuilder('reward')
      .select([
        'reward.rewardType as rewardType',
        'reward.rewardToken as rewardToken',
        'SUM(reward.rewardAmount) as totalAmount',
        'COUNT(*) as count'
      ])
      .where('reward.claimAddress = :claimAddress', { claimAddress })
      .groupBy('reward.rewardType, reward.rewardToken');

    if (chainId) {
      queryBuilder.andWhere('reward.chainId = :chainId', { chainId });
    }

    return await queryBuilder.getRawMany();
  }

  /**
   * 删除奖励记录
   */
  async deleteRewardRecord(id: number): Promise<void> {
    const result = await this.rewardRecordRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException('奖励记录不存在');
    }
  }
}