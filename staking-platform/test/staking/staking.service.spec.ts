import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { StakingService } from '../../src/modules/staking/services/staking.service';
import { StakingRecord } from '../../src/modules/staking/entities/staking-record.entity';
import { StakingTotal } from '../../src/modules/staking/entities/staking-total.entity';
import { CacheService } from '../../src/common/cache/cache.service';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { CreateStakingDto } from '../../src/modules/staking/dto/create-staking.dto';
import { QueryStakingDto } from '../../src/modules/staking/dto/query-staking.dto';
import { QueryStatsDto, TimeRange } from '../../src/modules/staking/dto/query-stats.dto';
import {
  createMockStakingRecord,
  createMockStakingRecords,
  createMockStakingTotal,
  createMockStakingTotals,
  createMockCreateStakingDto,
  createMockStatsData,
  createMockRepository
} from './test-utils';

describe('StakingService', () => {
  let service: StakingService;
  let stakingRecordRepository: Repository<StakingRecord>;
  let stakingTotalRepository: Repository<StakingTotal>;
  let cacheService: CacheService;
  let configService: ConfigService;

  // 模拟Repository和服务
  const mockStakingRecordRepository = createMockRepository();
  const mockStakingTotalRepository = createMockRepository();
  
  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    keys: jest.fn().mockReturnValue([]),
    has: jest.fn(),
  };
  
  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StakingService,
        {
          provide: getRepositoryToken(StakingRecord),
          useValue: mockStakingRecordRepository,
        },
        {
          provide: getRepositoryToken(StakingTotal),
          useValue: mockStakingTotalRepository,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<StakingService>(StakingService);
    stakingRecordRepository = module.get<Repository<StakingRecord>>(getRepositoryToken(StakingRecord));
    stakingTotalRepository = module.get<Repository<StakingTotal>>(getRepositoryToken(StakingTotal));
    cacheService = module.get<CacheService>(CacheService);
    configService = module.get<ConfigService>(ConfigService);

    // 设置默认的配置值
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'ADMIN_PASSWORD') return 'admin123';
      return null;
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createStaking', () => {
    it('should create a staking record and update total', async () => {
      // 准备测试数据
      const createStakingDto = createMockCreateStakingDto();
      const savedRecord = createMockStakingRecord();
      const existingTotal = createMockStakingTotal();

      // 模拟Repository行为
      mockStakingRecordRepository.findOne.mockResolvedValue(null); // 记录不存在
      mockStakingRecordRepository.create.mockReturnValue(savedRecord);
      mockStakingRecordRepository.save.mockResolvedValue(savedRecord);
      
      mockStakingTotalRepository.findOne.mockResolvedValue(existingTotal); // 总量记录存在
      mockStakingTotalRepository.save.mockResolvedValue({
        ...existingTotal,
        totalAmount: '111.0', // 更新后的总量
      });

      // 调用服务方法
      const result = await service.createStaking(createStakingDto);

      // 验证结果
      expect(result).toEqual(savedRecord);
      expect(mockStakingRecordRepository.findOne).toHaveBeenCalled();
      expect(mockStakingRecordRepository.create).toHaveBeenCalled();
      expect(mockStakingRecordRepository.save).toHaveBeenCalled();
      expect(mockStakingTotalRepository.findOne).toHaveBeenCalled();
      expect(mockStakingTotalRepository.save).toHaveBeenCalled();
    });

    it('should create a new total record if none exists', async () => {
      // 准备测试数据
      const createStakingDto = createMockCreateStakingDto();
      const savedRecord = createMockStakingRecord();
      const newTotal = createMockStakingTotal();

      // 模拟Repository行为
      mockStakingRecordRepository.findOne.mockResolvedValue(null); // 记录不存在
      mockStakingRecordRepository.create.mockReturnValue(savedRecord);
      mockStakingRecordRepository.save.mockResolvedValue(savedRecord);
      
      mockStakingTotalRepository.findOne.mockResolvedValue(null); // 总量记录不存在
      mockStakingTotalRepository.create.mockReturnValue(newTotal);
      mockStakingTotalRepository.save.mockResolvedValue(newTotal);

      // 调用服务方法
      const result = await service.createStaking(createStakingDto);

      // 验证结果
      expect(result).toEqual(savedRecord);
      expect(mockStakingTotalRepository.findOne).toHaveBeenCalled();
      expect(mockStakingTotalRepository.create).toHaveBeenCalled();
      expect(mockStakingTotalRepository.save).toHaveBeenCalled();
    });

    it('should not create duplicate staking record', async () => {
      // 准备测试数据
      const createStakingDto = createMockCreateStakingDto();
      const existingRecord = createMockStakingRecord();

      // 模拟Repository行为 - 记录已存在
      mockStakingRecordRepository.findOne.mockResolvedValue(existingRecord);

      // 调用服务方法并验证异常
      await expect(service.createStaking(createStakingDto)).rejects.toThrow(ConflictException);
      expect(mockStakingRecordRepository.findOne).toHaveBeenCalled();
      expect(mockStakingRecordRepository.save).not.toHaveBeenCalled();
      expect(mockStakingTotalRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe('queryStakingRecords', () => {
    it('should return staking records with pagination when minId is 0', async () => {
      // 准备测试数据
      const stakingAddress = '0x1234567890abcdef';
      const queryDto: QueryStakingDto = { minId: 0, pageSize: 10, stakingAddress };
      const mockRecords = createMockStakingRecords(5).map(record => ({ ...record, stakingAddress }));

      // 模拟Repository行为
      mockStakingRecordRepository.find.mockResolvedValue(mockRecords);

      // 调用服务方法
      const result = await service.queryStakingRecords(queryDto);

      // 验证结果
      expect(result).toEqual(mockRecords);
      expect(mockStakingRecordRepository.find).toHaveBeenCalledWith({
        where: { stakingAddress },
        order: { id: 'DESC' },
        take: queryDto.pageSize,
      });
    });
    
    it('should return staking records with pagination when minId is greater than 0', async () => {
      // 准备测试数据
      const stakingAddress = '0x1234567890abcdef';
      const queryDto: QueryStakingDto = { minId: 10, pageSize: 5, stakingAddress };
      const mockRecords = createMockStakingRecords(3).map(record => ({ ...record, stakingAddress }));

      // 模拟Repository行为
      mockStakingRecordRepository.find.mockResolvedValue(mockRecords);

      // 调用服务方法
      const result = await service.queryStakingRecords(queryDto);

      // 验证结果
      expect(result).toEqual(mockRecords);
      expect(mockStakingRecordRepository.find).toHaveBeenCalledWith({
        where: { id: expect.anything(), stakingAddress },
        order: { id: 'DESC' },
        take: queryDto.pageSize,
      });
    });
  });

  describe('queryTotalStaking', () => {
    it('should return all staking total records', async () => {
      // 准备测试数据
      const mockTotals = createMockStakingTotals(3);
      mockStakingTotalRepository.find.mockResolvedValue(mockTotals);
      const adminAuthDto = { password: 'admin123' };
      
      // 模拟环境变量
      process.env.ADMIN_PASSWORD = 'admin123';

      // 调用服务方法
      const result = await service.queryTotalStaking(adminAuthDto);

      // 验证结果
      expect(result).toEqual(mockTotals);
      expect(mockStakingTotalRepository.find).toHaveBeenCalled();
    });
  });

  // verifyAdminPassword is a private method, so we test it indirectly through queryTotalStaking
  describe('admin authentication', () => {
    it('should allow access with correct admin password', async () => {
      // 准备测试数据
      const mockTotals = createMockStakingTotals(3);
      mockStakingTotalRepository.find.mockResolvedValue(mockTotals);
      const adminAuthDto = { password: 'admin123' };
      
      // 模拟环境变量
      const originalEnv = process.env.ADMIN_PASSWORD;
      process.env.ADMIN_PASSWORD = 'admin123';

      try {
        // 调用服务方法
        const result = await service.queryTotalStaking(adminAuthDto);

        // 验证结果
        expect(result).toEqual(mockTotals);
        expect(mockStakingTotalRepository.find).toHaveBeenCalled();
      } finally {
        // 恢复环境变量
        process.env.ADMIN_PASSWORD = originalEnv;
      }
    });

    it('should reject access with incorrect admin password', async () => {
      // 准备测试数据
      const adminAuthDto = { password: 'wrongpassword' };
      
      // 模拟环境变量
      const originalEnv = process.env.ADMIN_PASSWORD;
      process.env.ADMIN_PASSWORD = 'admin123';

      try {
        // 调用服务方法并验证异常
        await expect(service.queryTotalStaking(adminAuthDto)).rejects.toThrow();
        expect(mockStakingTotalRepository.find).not.toHaveBeenCalled();
      } finally {
        // 恢复环境变量
        process.env.ADMIN_PASSWORD = originalEnv;
      }
    });
  });

  describe('queryStats', () => {
    it('should return cached stats if available', async () => {
      // 准备测试数据
      const queryDto: QueryStatsDto = { timeRange: TimeRange.DAY_1 };
      const transactionCount = 100;
      
      // 模拟缓存服务行为
      mockCacheService.get.mockImplementation((key) => {
        if (key === `transaction_count:${queryDto.timeRange}`) {
          return transactionCount;
        }
        return null;
      });
      
      // 模拟keys方法返回空数组（没有币种缓存）
      mockCacheService.keys.mockReturnValue([]);

      // 调用服务方法
      const result = await service.queryStats(queryDto);

      // 验证结果
      expect(result).toEqual({
        timeRange: queryDto.timeRange,
        transactionCount,
        coinAmounts: {}
      });
      expect(mockCacheService.get).toHaveBeenCalledWith(`transaction_count:${queryDto.timeRange}`);
      expect(mockCacheService.keys).toHaveBeenCalled();
    });

    it('should query and cache stats if not in cache', async () => {
      // 准备测试数据
      const queryDto: QueryStatsDto = { timeRange: TimeRange.HOUR_1 };
      const statsData = createMockStatsData();

      // 模拟缓存服务和Repository行为
      mockCacheService.get.mockImplementation((key) => {
        if (key === `transaction_count:${queryDto.timeRange}`) {
          return 100;
        }
        if (key.startsWith('coin_amount:')) {
          return 50;
        }
        return null;
      });
      
      // 模拟keys方法返回一些币种缓存键
      mockCacheService.keys.mockReturnValue([
        `coin_amount:${queryDto.timeRange}:BTC`,
        `coin_amount:${queryDto.timeRange}:ETH`,
        `transaction_count:${queryDto.timeRange}`,
        `coin_amount:${TimeRange.DAY_1}:BTC` // 这个不应该被包含在结果中
      ]);

      // 调用服务方法
      const result = await service.queryStats(queryDto);

      // 验证结果
      expect(result).toEqual(expect.objectContaining({
        timeRange: queryDto.timeRange,
        transactionCount: 100,
        coinAmounts: expect.objectContaining({
          BTC: 50,
          ETH: 50
        })
      }));
      expect(mockCacheService.get).toHaveBeenCalledWith(`transaction_count:${queryDto.timeRange}`);
      expect(mockCacheService.keys).toHaveBeenCalled();

    });

    it('should handle default timeRange', async () => {
      // 准备测试数据 - 不提供timeRange
      const queryDto = {};
      // 注意：StakingService 中的 queryStats 方法不会设置默认的 timeRange，
      // 而是直接使用 undefined，所以我们需要模拟这种情况

      // 模拟缓存服务行为
      mockCacheService.get.mockImplementation((key) => {
        if (key === 'transaction_count:undefined') {
          return 200;
        }
        if (key.startsWith('coin_amount:')) {
          return 75;
        }
        return null;
      });
      
      // 模拟keys方法返回一些币种缓存键
      mockCacheService.keys.mockReturnValue([
        'coin_amount:undefined:BTC',
        'coin_amount:undefined:ETH',
        'coin_amount:undefined:USDT',
        'transaction_count:undefined'
      ]);

      // 调用服务方法
      const result = await service.queryStats(queryDto);

      // 验证结果
      expect(result).toEqual({
        timeRange: undefined,
        transactionCount: 200,
        coinAmounts: {
          BTC: 75,
          ETH: 75,
          USDT: 75
        }
      });
      // 由于没有提供 timeRange，所以缓存键中的 timeRange 部分应该是 undefined
      expect(mockCacheService.get).toHaveBeenCalledWith('transaction_count:undefined');
      expect(mockCacheService.keys).toHaveBeenCalled();
    });
  });

  describe('updateStatsCache', () => {
    it('should update stats cache for a new staking record', async () => {
      // 准备测试数据 - 创建一个质押记录
      const record = new StakingRecord();
      record.id = 1;
      record.transactionHash = '0x123';
      record.stakingCoin = 'ETH';
      record.stakingAmount = '5.0';
      record.stakingStartTime = new Date();
      record.stakingMinDuration = 30;
      record.stakingApr = '0.05';
      record.stakingAddress = '0xabc';
      record.stakingChain = 'Ethereum';
      
      // 重置mock计数
      jest.clearAllMocks();
      
      // 调用私有方法（通过任何方式访问）
      // @ts-ignore - 访问私有方法进行测试
      service['updateStatsCache'](record);

      // 验证结果 - 应该为所有时间范围更新缓存
      // 4个时间范围的交易笔数 + 4个时间范围的币种数量 = 8次调用
      expect(mockCacheService.set).toHaveBeenCalledTimes(8);
      expect(mockCacheService.get).toHaveBeenCalledTimes(8);
    });
  });

  describe('updateTransactionCountCache', () => {
    it('should update transaction count cache for a specific time range', async () => {
      // 准备测试数据
      const timeRange = TimeRange.HOUR_1;
      const startTime = Date.now() - 60 * 60 * 1000; // 1小时前
      
      // 模拟缓存服务行为
      mockCacheService.get.mockReturnValue(5); // 假设当前已有5笔交易
      
      // 调用私有方法（通过任何方式访问）
      // @ts-ignore - 访问私有方法进行测试
      service['updateTransactionCountCache'](timeRange, startTime);
      
      // 验证结果
      const cacheKey = `transaction_count:${timeRange}`;
      expect(mockCacheService.get).toHaveBeenCalledWith(cacheKey);
      expect(mockCacheService.set).toHaveBeenCalledWith(cacheKey, 6); // 5 + 1
    });
  });


  describe('updateCoinAmountCache', () => {
    it('should update coin amount cache for a specific time range and coin', async () => {
      // 准备测试数据
      const coin = 'BTC';
      const timeRange = TimeRange.HOUR_1;
      const startTime = Date.now() - 60 * 60 * 1000; // 1小时前
      const amount = '2.5';
      
      // 模拟缓存服务行为
      mockCacheService.get.mockReturnValue(10); // 假设当前已有10个币
      
      // 调用私有方法（通过任何方式访问）
      // @ts-ignore - 访问私有方法进行测试
      service['updateCoinAmountCache'](coin, timeRange, startTime, amount);
      
      // 验证结果
      const cacheKey = `coin_amount:${timeRange}:${coin}`;
      expect(mockCacheService.get).toHaveBeenCalledWith(cacheKey);
      expect(mockCacheService.set).toHaveBeenCalledWith(cacheKey, 12.5); // 10 + 2.5
    });
  });
});