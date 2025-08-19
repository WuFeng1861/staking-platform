import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('staking_records')
@Index('IDX_staking_address', ['stakingAddress'])
@Index('IDX_chain_id', ['chainId'])
@Index('IDX_staking_hash', ['stakingHash'], { unique: true })
@Index('IDX_referral_reward_given', ['referralRewardGiven'])
@Index('IDX_staking_address_chain_referral', ['stakingAddress', 'chainId', 'referralRewardGiven'])
export class StakingRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'chain_id', comment: '链ID' })
  chainId: number;

  @Column({ name: 'staking_coin', length: 100, comment: '质押币种' })
  stakingCoin: string;

  @Column({ name: 'staking_hash', unique: true, comment: '质押交易哈希' })
  stakingHash: string;

  @Column({ name: 'staking_amount', type: 'decimal', precision: 30, scale: 18, comment: '质押数量' })
  stakingAmount: string;

  @Column({ name: 'staking_start_time', type: 'timestamp', comment: '质押起始时间' })
  stakingStartTime: Date;

  @Column({ name: 'staking_lock_duration', comment: '质押锁仓时间（秒）' })
  stakingLockDuration: number;

  @Column({ name: 'staking_apy', type: 'decimal', precision: 10, scale: 4, comment: '质押年化率(%)' })
  stakingApy: number;

  @Column({ name: 'staking_address', comment: '质押地址' })
  stakingAddress: string;

  @Column({ name: 'nexafi_reward_amount', type: 'decimal', precision: 30, scale: 18, default: '0', comment: 'NexaFi奖励数量' })
  nexafiRewardAmount: string;

  @Column({ name: 'referral_reward_given', type: 'tinyint', width: 1, default: 0, comment: '是否已发放推荐奖励' })
  referralRewardGiven: boolean;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;
}