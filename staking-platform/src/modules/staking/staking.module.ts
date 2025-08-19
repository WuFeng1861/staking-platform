import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StakingRecord } from './entities/staking-record.entity';
import { StakingService } from './services/staking.service';
import { StakingController } from './controllers/staking.controller';
import { ExchangeModule } from '../exchange/exchange.module';
import { RewardModule } from '../reward/reward.module';
import { ReferralModule } from '../referral/referral.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StakingRecord]),
    ExchangeModule,
    forwardRef(() => RewardModule),
    ReferralModule,
  ],
  controllers: [StakingController],
  providers: [StakingService],
  exports: [StakingService],
})
export class StakingModule {}