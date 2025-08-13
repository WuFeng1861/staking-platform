import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('staking_records')
@Index(['stakingCoin', 'stakingChain']) // 联合索引：质押币种和质押的链
export class StakingRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  transactionHash: string; // 交易hash，唯一索引

  @Column()
  stakingCoin: string; // 质押币种

  @Column('decimal', { precision: 36, scale: 18 })
  stakingAmount: string; // 质押数量

  @Column({ type: 'timestamp' })
  stakingStartTime: Date; // 质押起始时间

  @Column({ type: 'int' })
  stakingMinDuration: number; // 质押最短时间（秒）

  @Column('decimal', { precision: 10, scale: 2 })
  stakingApr: string; // 质押年化

  @Column()
  @Index() // 单独索引：质押地址
  stakingAddress: string; // 质押地址

  @Column()
  stakingChain: string; // 质押的链

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}