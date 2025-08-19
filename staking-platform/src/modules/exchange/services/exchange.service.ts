import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import BigNumber from 'bignumber.js';
import { TokenExchangeRate } from '../entities/token-exchange-rate.entity';
import { CreateExchangeRateDto } from '../dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from '../dto/update-exchange-rate.dto';

@Injectable()
export class ExchangeService {
  constructor(
    @InjectRepository(TokenExchangeRate)
    private readonly exchangeRateRepository: Repository<TokenExchangeRate>,
  ) {}

  /**
   * 创建兑换比例
   */
  async createExchangeRate(createExchangeRateDto: CreateExchangeRateDto): Promise<TokenExchangeRate> {
    // 检查币种对是否已存在
    const existingRate = await this.exchangeRateRepository.findOne({
      where: { 
        fromToken: createExchangeRateDto.fromToken,
        toToken: createExchangeRateDto.toToken
      }
    });

    if (existingRate) {
      throw new ConflictException('该币种兑换对已存在');
    }

    const exchangeRate = this.exchangeRateRepository.create(createExchangeRateDto);
    return await this.exchangeRateRepository.save(exchangeRate);
  }

  /**
   * 获取所有兑换比例
   */
  async getAllExchangeRates(): Promise<TokenExchangeRate[]> {
    return await this.exchangeRateRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * 获取启用的兑换比例
   */
  async getActiveExchangeRates(): Promise<TokenExchangeRate[]> {
    return await this.exchangeRateRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * 根据币种对获取兑换比例（支持双向查找）
   */
  async getExchangeRate(fromToken: string, toToken: string): Promise<TokenExchangeRate> {
    // 首先尝试直接查找
    let rate = await this.exchangeRateRepository.findOne({
      where: { 
        fromToken,
        toToken,
        isActive: true
      }
    });

    if (rate) {
      return rate;
    }

    // 如果直接查找失败，尝试反向查找
    const reverseRate = await this.exchangeRateRepository.findOne({
      where: { 
        fromToken: toToken,
        toToken: fromToken,
        isActive: true
      }
    });

    if (reverseRate) {
      // 创建一个虚拟的兑换比例对象，计算倒数
      const reversedExchangeRate = new BigNumber(1).dividedBy(new BigNumber(reverseRate.exchangeRate)).toString();
      
      // 返回一个临时的兑换比例对象
      const virtualRate = new TokenExchangeRate();
      virtualRate.id = reverseRate.id;
      virtualRate.fromToken = fromToken;
      virtualRate.toToken = toToken;
      virtualRate.exchangeRate = reversedExchangeRate;
      virtualRate.isActive = reverseRate.isActive;
      virtualRate.createdAt = reverseRate.createdAt;
      virtualRate.updatedAt = reverseRate.updatedAt;
      
      return virtualRate;
    }

    throw new NotFoundException(`未找到 ${fromToken} 到 ${toToken} 的兑换比例`);
  }

  /**
   * 计算兑换数量
   */
  async calculateExchange(fromToken: string, toToken: string, amount: string): Promise<{ fromAmount: string; toAmount: string; rate: string }> {
    const exchangeRate = await this.getExchangeRate(fromToken, toToken);
    
    const fromAmount = amount;
    const rate = exchangeRate.exchangeRate;
    
    // 使用 BigNumber 进行精确计算
    const fromAmountBN = new BigNumber(amount);
    const rateBN = new BigNumber(rate);
    const toAmount = fromAmountBN.multipliedBy(rateBN).toString();

    return {
      fromAmount,
      toAmount,
      rate
    };
  }

  /**
   * 更新兑换比例
   */
  async updateExchangeRate(id: number, updateExchangeRateDto: UpdateExchangeRateDto): Promise<TokenExchangeRate> {
    const exchangeRate = await this.exchangeRateRepository.findOne({ where: { id } });
    
    if (!exchangeRate) {
      throw new NotFoundException('兑换比例不存在');
    }

    Object.assign(exchangeRate, updateExchangeRateDto);
    return await this.exchangeRateRepository.save(exchangeRate);
  }

  /**
   * 删除兑换比例
   */
  async deleteExchangeRate(id: number): Promise<void> {
    const result = await this.exchangeRateRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException('兑换比例不存在');
    }
  }

  /**
   * 启用/禁用兑换比例
   */
  async toggleExchangeRate(id: number, isActive: boolean): Promise<TokenExchangeRate> {
    const exchangeRate = await this.exchangeRateRepository.findOne({ where: { id } });
    
    if (!exchangeRate) {
      throw new NotFoundException('兑换比例不存在');
    }

    exchangeRate.isActive = isActive;
    return await this.exchangeRateRepository.save(exchangeRate);
  }
}