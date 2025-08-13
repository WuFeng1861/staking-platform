import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StakingController } from './controllers/staking.controller';
import { StakingService } from './services/staking.service';
import { StakingRecord } from './entities/staking-record.entity';
import { StakingTotal } from './entities/staking-total.entity';
import { CacheService } from '../../common/cache/cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([StakingRecord, StakingTotal])],
  controllers: [StakingController],
  providers: [StakingService, CacheService],
  exports: [StakingService],
})
export class StakingModule {}