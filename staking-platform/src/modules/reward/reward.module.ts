import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardRecord } from './entities/reward-record.entity';
import { RewardService } from './services/reward.service';
import { RewardController } from './controllers/reward.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RewardRecord])],
  controllers: [RewardController],
  providers: [RewardService],
  exports: [RewardService],
})
export class RewardModule {}