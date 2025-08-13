import { Controller, Post, Get, Body, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { NftService } from '../services/nft.service';
import { CreateNftTransactionDto } from '../dto/create-nft-transaction.dto';
import { QueryNftTransactionDto } from '../dto/query-nft-transaction.dto';
import { NftTransaction } from '../entities/nft-transaction.entity';

@Controller('nft')
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @Post('transaction')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createNftTransaction(@Body() createNftTransactionDto: CreateNftTransactionDto): Promise<NftTransaction> {
    return this.nftService.createNftTransaction(createNftTransactionDto);
  }

  @Get('transactions')
  @UsePipes(new ValidationPipe({ transform: true }))
  async queryNftTransactions(@Query() query: QueryNftTransactionDto): Promise<NftTransaction[]> {
    return this.nftService.queryNftTransactions(query);
  }

  @Get('max-id')
  async getMaxId(): Promise<{ maxId: number }> {
    return this.nftService.getMaxId();
  }
}