import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum RewardType {
  STAKING = 'staking',
  REFERRAL = 'referral',
  BONUS = 'bonus',
  AIRDROP = 'airdrop'
}

@Entity('reward_records')
@Index('IDX_reward_claim_address', ['claimAddress'])
@Index('IDX_reward_chain_id', ['chainId'])
@Index('IDX_reward_type', ['rewardType'])
@Index('IDX_reward_time', ['rewardTime'])
@Index('IDX_reward_hash_type_address', ['claimHash', 'rewardType', 'claimAddress'], { unique: true })
export class RewardRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'chain_id', comment: '链ID' })
  chainId: number;

  @Column({ name: 'claim_hash', unique: true, comment: '领取奖励交易哈希' })
  claimHash: string;

  @Column({ name: 'reward_token', length: 100, comment: '领取奖励币种' })
  rewardToken: string;

  @Column({ name: 'reward_time', type: 'timestamp', comment: '领取奖励时间' })
  rewardTime: Date;

  @Column({ name: 'staking_apy', type: 'decimal', precision: 10, scale: 4, comment: '质押年化率(%)' })
  stakingApy: number;

  @Column({ name: 'claim_time', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', comment: '领取时间' })
  claimTime: Date;

  @Column({ name: 'reward_amount', type: 'decimal', precision: 30, scale: 18, comment: '领取奖励数量' })
  rewardAmount: string;

  @Column({ name: 'claim_address', comment: '领取地址' })
  claimAddress: string;

  @Column({ name: 'reward_type', type: 'enum', enum: RewardType, comment: '奖励类型' })
  rewardType: RewardType;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;
}