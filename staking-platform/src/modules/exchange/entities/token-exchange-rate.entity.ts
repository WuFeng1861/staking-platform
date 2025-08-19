import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('token_exchange_rates')
@Index('IDX_exchange_from_to_token', ['fromToken', 'toToken'], { unique: true })
@Index('IDX_exchange_from_token', ['fromToken'])
@Index('IDX_exchange_to_token', ['toToken'])
export class TokenExchangeRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'from_token', length: 100, comment: '源币种' })
  fromToken: string;

  @Column({ name: 'to_token', length: 100, comment: '目标币种' })
  toToken: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 30, scale: 18, comment: '兑换比例' })
  exchangeRate: string;

  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1, comment: '是否启用' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;
}