import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NftTransaction } from './entities/nft-transaction.entity';
import { NftService } from './services/nft.service';
import { NftController } from './controllers/nft.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NftTransaction])],
  providers: [NftService],
  controllers: [NftController],
  exports: [NftService],
})
export class NftModule {}