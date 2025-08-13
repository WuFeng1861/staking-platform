import { Test, TestingModule } from '@nestjs/testing';
import { StakingController } from '../../src/modules/staking/controllers/staking.controller';
import { StakingService } from '../../src/modules/staking/services/staking.service';
import { CreateStakingDto } from '../../src/modules/staking/dto/create-staking.dto';
import { QueryStakingDto } from '../../src/modules/staking/dto/query-staking.dto';
import { AdminAuthDto } from '../../src/modules/staking/dto/admin-auth.dto';
import { QueryStatsDto, TimeRange } from '../../src/modules/staking/dto/query-stats.dto';
import { UnauthorizedException } from '@nestjs/common';

describe('StakingController', () => {
  let controller: StakingController;
  let stakingService: StakingService;

  // 模拟StakingService
  const mockStakingService = {
    createStaking: jest.fn(),
    queryStakingRecords: jest.fn(),
    queryTotalStaking: jest.fn(),
    queryStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StakingController],
      providers: [
        {
          provide: StakingService,
          useValue: mockStakingService,
        },
      ],
    }).compile();

    controller = module.get<StakingController>(StakingController);
    stakingService = module.get<StakingService>(StakingService);

    // 重置所有模拟函数
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createStaking', () => {
    it('should create a staking record successfully', async () => {
      // 准备测试数据
      const createStakingDto: CreateStakingDto = {
        transactionHash: '0x123456789abcdef',
        stakingCoin: 'ETH',
        stakingAmount: '10.5',
        stakingStartTime: new Date().toISOString(),
        stakingMinDuration: 30,
        stakingApr: '5.2',
        stakingAddress: '0xabcdef123456789',
        stakingChain: 'Ethereum',
      };

      const expectedResult = { success: true };
      mockStakingService.createStaking.mockResolvedValue(expectedResult);

      // 调用控制器方法
      const result = await controller.createStaking(createStakingDto);

      // 验证结果
      expect(result).toEqual(expectedResult);
      expect(mockStakingService.createStaking).toHaveBeenCalledWith(createStakingDto);
    });
  });

  describe('queryStakingRecords', () => {
    it('should return staking records', async () => {
      // 准备测试数据
      const queryStakingDto: QueryStakingDto = {
        minId: 0,
        pageSize: 10,
        stakingAddress: '0xabcdef123456789',
      };

      const expectedRecords = [
        { id: 1, stakingCoin: 'ETH', stakingAmount: '10.5', stakingAddress: '0xabcdef123456789' },
        { id: 2, stakingCoin: 'BTC', stakingAmount: '0.5', stakingAddress: '0xabcdef123456789' },
      ];

      mockStakingService.queryStakingRecords.mockResolvedValue(expectedRecords);

      // 调用控制器方法
      const result = await controller.queryStakingRecords(queryStakingDto);

      // 验证结果
      expect(result).toEqual(expectedRecords);
      expect(mockStakingService.queryStakingRecords).toHaveBeenCalledWith(queryStakingDto);
    });

    it('should return staking records filtered by stakingAddress', async () => {
      // 准备测试数据
      const stakingAddress = '0xabcdef123456789';
      const queryStakingDto: QueryStakingDto = {
        minId: 0,
        pageSize: 10,
        stakingAddress,
      };

      const expectedRecords = [
        { id: 1, stakingCoin: 'ETH', stakingAmount: '10.5', stakingAddress },
        { id: 2, stakingCoin: 'BTC', stakingAmount: '0.5', stakingAddress },
      ];

      mockStakingService.queryStakingRecords.mockResolvedValue(expectedRecords);

      // 调用控制器方法
      const result = await controller.queryStakingRecords(queryStakingDto);

      // 验证结果
      expect(result).toEqual(expectedRecords);
      expect(mockStakingService.queryStakingRecords).toHaveBeenCalledWith(queryStakingDto);
    });
  });

  describe('queryTotalStaking', () => {
    it('should return total staking when admin password is valid', async () => {
      // 准备测试数据
      const adminAuthDto: AdminAuthDto = {
        password: 'admin123',
      };

      const expectedTotals = [
        { stakingChain: 'Ethereum', stakingCoin: 'ETH', totalAmount: '100.5' },
        { stakingChain: 'Bitcoin', stakingCoin: 'BTC', totalAmount: '5.5' },
      ];

      // 模拟 StakingService 的 queryTotalStaking 方法
      mockStakingService.queryTotalStaking.mockResolvedValue(expectedTotals);

      // 调用控制器方法
      const result = await controller.queryTotalStaking(adminAuthDto);

      // 验证结果
      expect(result).toEqual(expectedTotals);
      expect(mockStakingService.queryTotalStaking).toHaveBeenCalledWith(adminAuthDto);
    });

    it('should pass through UnauthorizedException from service', async () => {
      // 准备测试数据
      const adminAuthDto: AdminAuthDto = {
        password: 'wrongpassword',
      };

      // 模拟 StakingService 的 queryTotalStaking 方法抛出异常
      mockStakingService.queryTotalStaking.mockRejectedValue(new UnauthorizedException('管理员密码错误'));

      // 验证抛出异常
      await expect(controller.queryTotalStaking(adminAuthDto)).rejects.toThrow(UnauthorizedException);
      expect(mockStakingService.queryTotalStaking).toHaveBeenCalledWith(adminAuthDto);
    });
  });

  describe('queryStats', () => {
    it('should return stats data', async () => {
      // 准备测试数据
      const queryStatsDto: QueryStatsDto = {
        timeRange: TimeRange.DAY_1,
      };

      const expectedStats = {
        totalTransactions: 100,
        totalCoins: 5,
        totalAmount: '1000.5',
      };

      mockStakingService.queryStats.mockResolvedValue(expectedStats);

      // 调用控制器方法
      const result = await controller.queryStats(queryStatsDto);

      // 验证结果
      expect(result).toEqual(expectedStats);
      expect(mockStakingService.queryStats).toHaveBeenCalledWith(queryStatsDto);
    });

    it('should use default timeRange when not provided', async () => {
      // 准备测试数据 - 不提供timeRange
      const queryStatsDto = {};

      const expectedStats = {
        totalTransactions: 100,
        totalCoins: 5,
        totalAmount: '1000.5',
      };

      mockStakingService.queryStats.mockResolvedValue(expectedStats);

      // 调用控制器方法
      const result = await controller.queryStats(queryStatsDto);

      // 验证结果
      expect(result).toEqual(expectedStats);
      expect(mockStakingService.queryStats).toHaveBeenCalledWith(queryStatsDto);
    });
  });
});