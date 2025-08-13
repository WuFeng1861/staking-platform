import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('nft_transaction')
export class NftTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  transactionHash: string;

  @Column({ length: 50 })
  stakingCoin: string;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  stakingAmount: string;

  @Column({ type: 'timestamp' })
  stakingStartTime: Date;

  @Column()
  stakingMinDuration: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  stakingApr: string;

  @Index()
  @Column({ length: 255 })
  fromAddress: string;

  @Index()
  @Column({ length: 255 })
  toAddress: string;

  @Column({ length: 50 })
  stakingChain: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}