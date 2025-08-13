import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { StakingRecord } from '../entities/staking-record.entity';
import { StakingTotal } from '../entities/staking-total.entity';
import { CreateStakingDto } from '../dto/create-staking.dto';
import { QueryStakingDto } from '../dto/query-staking.dto';
import { AdminAuthDto } from '../dto/admin-auth.dto';
import { QueryStatsDto, TimeRange } from '../dto/query-stats.dto';
import { CacheService } from '../../../common/cache/cache.service';


@Injectable()
export class StakingService {
  constructor(
    @InjectRepository(StakingRecord)
    private stakingRecordRepository: Repository<StakingRecord>,
    @InjectRepository(StakingTotal)
    private stakingTotalRepository: Repository<StakingTotal>,
    private cacheService: CacheService,
  ) {}

  /**
   * 创建质押记录
   */
  async createStaking(createStakingDto: CreateStakingDto): Promise<StakingRecord> {
    // 检查交易hash是否已存在
    const existingRecord = await this.stakingRecordRepository.findOne({
      where: { transactionHash: createStakingDto.transactionHash },
    });

    if (existingRecord) {
      throw new ConflictException('该交易hash已存在');
    }

    // 创建新的质押记录
    const newRecord = this.stakingRecordRepository.create({
      ...createStakingDto,
      stakingStartTime: new Date(createStakingDto.stakingStartTime),
    });

    // 保存质押记录
    const savedRecord = await this.stakingRecordRepository.save(newRecord);

    // 更新质押总量
    await this.updateStakingTotal(
      createStakingDto.stakingChain,
      createStakingDto.stakingCoin,
      createStakingDto.stakingAmount,
    );

    // 更新缓存中的统计数据
    this.updateStatsCache(savedRecord);

    return savedRecord;
  }

  /**
   * 更新质押总量
   */
  private async updateStakingTotal(
    stakingChain: string,
    stakingCoin: string,
    amount: string,
  ): Promise<void> {
    // 查找现有的总量记录
    let totalRecord = await this.stakingTotalRepository.findOne({
      where: {
        stakingChain,
        stakingCoin,
      },
    });

    if (totalRecord) {
      // 更新现有记录
      const currentAmount = parseFloat(totalRecord.totalAmount);
      const addAmount = parseFloat(amount);
      totalRecord.totalAmount = (currentAmount + addAmount).toString();
      await this.stakingTotalRepository.save(totalRecord);
    } else {
      // 创建新记录
      totalRecord = this.stakingTotalRepository.create({
        stakingChain,
        stakingCoin,
        totalAmount: amount,
      });
      await this.stakingTotalRepository.save(totalRecord);
    }
  }

  /**
   * 查询质押记录（分页）
   */
  async queryStakingRecords(queryDto: QueryStakingDto): Promise<StakingRecord[]> {
    const { minId, pageSize, stakingAddress } = queryDto;
    
    // 构建查询条件
    let whereCondition: any = {};
    
    whereCondition.stakingAddress = stakingAddress;
    
    // 如果minId为0，则获取最新的记录
    if (minId === 0) {
      return this.stakingRecordRepository.find({
        where: whereCondition,
        order: { id: 'DESC' },
        take: pageSize,
      });
    }
    
    // 否则获取ID小于minId的记录
    whereCondition.id = LessThan(minId);
    return this.stakingRecordRepository.find({
      where: whereCondition,
      order: { id: 'DESC' },
      take: pageSize,
    });
  }

  /**
   * 管理员查询所有质押总量
   */
  async queryTotalStaking(adminAuthDto: AdminAuthDto): Promise<StakingTotal[]> {
    // 验证管理员密码
    this.validateAdminPassword(adminAuthDto.password);
    
    // 查询所有质押总量记录
    return this.stakingTotalRepository.find();
  }

  /**
   * 验证管理员密码
   */
  private validateAdminPassword(password: string): void {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (password !== adminPassword) {
      throw new UnauthorizedException('管理员密码错误');
    }
  }

  /**
   * 更新统计缓存
   */
  private updateStatsCache(record: StakingRecord): void {
    const now = Date.now();
    const hourInMs = 60 * 60 * 1000;
    const dayInMs = 24 * hourInMs;
    const weekInMs = 7 * dayInMs;

    // 更新各时间段的交易笔数统计
    this.updateTransactionCountCache(TimeRange.HOUR_1, now - hourInMs);
    this.updateTransactionCountCache(TimeRange.DAY_1, now - dayInMs);
    this.updateTransactionCountCache(TimeRange.DAY_3, now - 3 * dayInMs);
    this.updateTransactionCountCache(TimeRange.WEEK_1, now - weekInMs);

    // 更新各时间段的币种数量统计
    this.updateCoinAmountCache(record.stakingCoin, TimeRange.HOUR_1, now - hourInMs, record.stakingAmount);
    this.updateCoinAmountCache(record.stakingCoin, TimeRange.DAY_1, now - dayInMs, record.stakingAmount);
    this.updateCoinAmountCache(record.stakingCoin, TimeRange.DAY_3, now - 3 * dayInMs, record.stakingAmount);
    this.updateCoinAmountCache(record.stakingCoin, TimeRange.WEEK_1, now - weekInMs, record.stakingAmount);
  }

  /**
   * 更新交易笔数缓存
   */
  private updateTransactionCountCache(timeRange: TimeRange, startTime: number): void {
    const cacheKey = `transaction_count:${timeRange}`;
    const count = this.cacheService.get<number>(cacheKey) || 0;
    this.cacheService.set(cacheKey, count + 1);
  }

  /**
   * 更新币种数量缓存
   */
  private updateCoinAmountCache(coin: string, timeRange: TimeRange, startTime: number, amount: string): void {
    const cacheKey = `coin_amount:${timeRange}:${coin}`;
    const currentAmount = this.cacheService.get<number>(cacheKey) || 0;
    this.cacheService.set(cacheKey, currentAmount + parseFloat(amount));
  }

  /**
   * 查询统计数据
   */
  async queryStats(queryDto: QueryStatsDto): Promise<any> {
    const { timeRange } = queryDto;
    
    // 获取交易笔数
    const transactionCount = this.cacheService.get<number>(`transaction_count:${timeRange}`) || 0;
    
    // 获取所有币种的缓存键
    const coinKeys = this.cacheService.keys().filter(key => key.startsWith(`coin_amount:${timeRange}`));
    
    // 构建币种数量统计
    const coinAmounts = {};
    for (const key of coinKeys) {
      const coin = key.split(':')[2]; // 格式：coin_amount:timeRange:coin
      coinAmounts[coin] = this.cacheService.get<number>(key) || 0;
    }
    
    return {
      timeRange,
      transactionCount,
      coinAmounts,
    };
  }
}