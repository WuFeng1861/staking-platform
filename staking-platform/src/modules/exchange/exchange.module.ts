import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenExchangeRate } from './entities/token-exchange-rate.entity';
import { ExchangeService } from './services/exchange.service';
import { ExchangeController } from './controllers/exchange.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TokenExchangeRate])],
  controllers: [ExchangeController],
  providers: [ExchangeService],
  exports: [ExchangeService],
})
export class ExchangeModule {}