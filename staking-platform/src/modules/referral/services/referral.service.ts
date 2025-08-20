import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referral } from '../entities/referral.entity';
import { BindReferralDto } from '../dto/bind-referral.dto';
import { QuerySubordinatesDto } from '../dto/query-subordinates.dto';

@Injectable()
export class ReferralService {
  constructor(
    @InjectRepository(Referral)
    private referralRepository: Repository<Referral>,
  ) {}

  /**
   * 绑定上级
   */
  async bindReferrer(bindReferralDto: BindReferralDto): Promise<{ success: boolean; message: string }> {
    const { currentAddress, referrerAddress, chainId, chainName, transactionHash } = bindReferralDto;

    // 检查是否自己绑定自己
    if (currentAddress.toLowerCase() === referrerAddress.toLowerCase()) {
      throw new BadRequestException('不能绑定自己为上级');
    }

    // 检查交易hash是否已存在
    const existingTransaction = await this.referralRepository.findOne({
      where: { transactionHash },
    });

    if (existingTransaction) {
      throw new ConflictException('该交易hash已存在');
    }

    // 检查当前地址在该链上是否已经绑定过上级
    const existingBinding = await this.referralRepository.findOne({
      where: {
        currentAddress,
        chainId,
      },
    });

    if (existingBinding) {
      throw new ConflictException('该地址在此链上已经绑定过上级');
    }

    // 检查是否会形成循环绑定（防止A绑定B，B又绑定A的情况）
    const circularBinding = await this.checkCircularBinding(currentAddress, referrerAddress, chainId);
    if (circularBinding) {
      throw new BadRequestException('不能形成循环绑定关系');
    }

    // 创建新的绑定记录
    const newReferral = this.referralRepository.create({
      currentAddress,
      referrerAddress,
      chainId,
      chainName,
      transactionHash,
    });

    await this.referralRepository.save(newReferral);

    return {
      success: true,
      message: '绑定上级成功',
    };
  }

  /**
   * 查询下级数量
   */
  async getSubordinatesCount(queryDto: QuerySubordinatesDto): Promise<{ count: number; chainCounts?: any }> {
    const { address, chainId } = queryDto;

    if (chainId) {
      // 查询指定链的下级数量
      const count = await this.referralRepository.count({
        where: {
          referrerAddress: address,
          chainId,
        },
      });

      return { count };
    } else {
      // 查询所有链的下级数量，并按链分组统计
      const totalCount = await this.referralRepository.count({
        where: {
          referrerAddress: address,
        },
      });

      // 按链分组统计
      const chainCounts = await this.referralRepository
        .createQueryBuilder('referral')
        .select('referral.chainId', 'chainId')
        .addSelect('referral.chainName', 'chainName')
        .addSelect('COUNT(*)', 'count')
        .where('referral.referrerAddress = :address', { address })
        .groupBy('referral.chainId')
        .addGroupBy('referral.chainName')
        .getRawMany();

      return {
        count: totalCount,
        chainCounts: chainCounts.map(item => ({
          chainId: item.chainId,
          chainName: item.chainName,
          count: parseInt(item.count),
        })),
      };
    }
  }

  /**
   * 根据地址获取推荐人关系
   */
  async getReferralByAddress(currentAddress: string, chainId: number): Promise<Referral | null> {
    return await this.referralRepository.findOne({
      where: {
        currentAddress,
        chainId: chainId.toString(),
      },
    });
  }

  /**
   * 更新推荐关系
   */
  async updateReferral(referral: Referral): Promise<Referral> {
    return await this.referralRepository.save(referral);
  }

  /**
   * 检查是否会形成循环绑定
   */
  private async checkCircularBinding(currentAddress: string, referrerAddress: string, chainId: string): Promise<boolean> {
    // 检查推荐人是否已经被当前地址推荐过
    const existingReferral = await this.referralRepository.findOne({
      where: {
        currentAddress: referrerAddress,
        referrerAddress: currentAddress,
        chainId,
      },
    });

    return !!existingReferral;
  }
}
