import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('referrals')
@Index('IDX_referral_current_chain', ['currentAddress', 'chainId'], { unique: true }) // 每个地址在每条链上只能绑定一次上级
export class Referral {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index('IDX_referral_current_address') // 当前地址索引
  currentAddress: string; // 当前地址

  @Column()
  @Index('IDX_referral_referrer_address') // 上级地址索引
  referrerAddress: string; // 上级地址

  @Column()
  chainId: string; // 当前链ID

  @Column()
  chainName: string; // 当前链名称

  @Column({ unique: true })
  transactionHash: string; // 交易hash，唯一

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}