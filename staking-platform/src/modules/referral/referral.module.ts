import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralController } from './controllers/referral.controller';
import { ReferralService } from './services/referral.service';
import { Referral } from './entities/referral.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Referral])],
  controllers: [ReferralController],
  providers: [ReferralService],
  exports: [ReferralService],
})
export class ReferralModule {}