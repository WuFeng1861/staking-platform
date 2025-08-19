import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NftModule } from './modules/nft/nft.module';
import { ReferralModule } from './modules/referral/referral.module';
import { RewardModule } from './modules/reward/reward.module';
import { ExchangeModule } from './modules/exchange/exchange.module';
import { StakingModule } from './modules/staking/staking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // 生产环境中应设置为false
    }),
    NftModule,
    ReferralModule,
    RewardModule,
    ExchangeModule,
    StakingModule,
  ],
})
export class AppModule {}
