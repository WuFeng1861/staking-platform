import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('staking_totals')
@Index(['stakingChain', 'stakingCoin'], { unique: true }) // 联合唯一索引：链和币种
export class StakingTotal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  stakingChain: string; // 质押的链

  @Column()
  stakingCoin: string; // 质押币种

  @Column('decimal', { precision: 36, scale: 18 })
  totalAmount: string; // 质押总币量

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}