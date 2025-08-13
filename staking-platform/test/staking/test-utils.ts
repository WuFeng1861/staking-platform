import { StakingRecord } from '../../src/modules/staking/entities/staking-record.entity';
import { StakingTotal } from '../../src/modules/staking/entities/staking-total.entity';
import { CreateStakingDto } from '../../src/modules/staking/dto/create-staking.dto';

/**
 * 生成测试用的质押记录数据
 */
export function createMockStakingRecord(id: number = 1): StakingRecord {
  const record = new StakingRecord();
  record.id = id;
  record.transactionHash = `0x${id}abcdef123456789`;
  record.stakingCoin = 'ETH';
  record.stakingAmount = '10.5';
  record.stakingStartTime = new Date();
  record.stakingMinDuration = 30;
  record.stakingApr = '5.2';
  record.stakingAddress = '0xabcdef123456789';
  record.stakingChain = 'Ethereum';
  record.createdAt = new Date();
  record.updatedAt = new Date();
  return record;
}

/**
 * 生成多个测试用的质押记录数据
 */
export function createMockStakingRecords(count: number = 5): StakingRecord[] {
  return Array.from({ length: count }, (_, i) => createMockStakingRecord(i + 1));
}

/**
 * 生成测试用的质押总量数据
 */
export function createMockStakingTotal(id: number = 1): StakingTotal {
  const total = new StakingTotal();
  total.id = id;
  total.stakingChain = 'Ethereum';
  total.stakingCoin = 'ETH';
  total.totalAmount = '100.5';
  total.createdAt = new Date();
  total.updatedAt = new Date();
  return total;
}

/**
 * 生成多个测试用的质押总量数据
 */
export function createMockStakingTotals(count: number = 3): StakingTotal[] {
  return Array.from({ length: count }, (_, i) => {
    const total = createMockStakingTotal(i + 1);
    if (i === 1) {
      total.stakingCoin = 'BTC';
      total.totalAmount = '5.5';
    } else if (i === 2) {
      total.stakingChain = 'Bitcoin';
      total.stakingCoin = 'BTC';
      total.totalAmount = '3.2';
    }
    return total;
  });
}

/**
 * 生成测试用的创建质押DTO
 */
export function createMockCreateStakingDto(): CreateStakingDto {
  const dto = new CreateStakingDto();
  dto.transactionHash = '0x123456789abcdef';
  dto.stakingCoin = 'ETH';
  dto.stakingAmount = '10.5';
  dto.stakingStartTime = new Date().toISOString();
  dto.stakingMinDuration = 30;
  dto.stakingApr = '5.2';
  dto.stakingAddress = '0xabcdef123456789';
  dto.stakingChain = 'Ethereum';
  return dto;
}

/**
 * 生成测试用的统计数据
 */
export function createMockStatsData() {
  return {
    totalTransactions: 100,
    totalCoins: 5,
    totalAmount: '1000.5',
  };
}

/**
 * 创建模拟的Repository
 */
export function createMockRepository() {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
      getRawMany: jest.fn(),
      execute: jest.fn(),
    })),
  };
}