import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { NftTransaction } from '../entities/nft-transaction.entity';
import { CreateNftTransactionDto } from '../dto/create-nft-transaction.dto';
import { QueryNftTransactionDto } from '../dto/query-nft-transaction.dto';

@Injectable()
export class NftService {
  constructor(
    @InjectRepository(NftTransaction)
    private nftTransactionRepository: Repository<NftTransaction>,
  ) {}

  async createNftTransaction(createNftTransactionDto: CreateNftTransactionDto): Promise<NftTransaction> {
    const newTransaction = this.nftTransactionRepository.create(createNftTransactionDto);
    return this.nftTransactionRepository.save(newTransaction);
  }

  async queryNftTransactions(query: QueryNftTransactionDto): Promise<NftTransaction[]> {
    const { address, minId, pageSize = 10 } = query;

    const queryBuilder = this.nftTransactionRepository.createQueryBuilder('nft_transaction');

    if (address) {
      queryBuilder.andWhere('(nft_transaction.fromAddress = :address OR nft_transaction.toAddress = :address)', { address });
    }

    if (minId) {
      queryBuilder.andWhere('nft_transaction.id < :minId', { minId });
    }

    queryBuilder.orderBy('nft_transaction.id', 'DESC');

    queryBuilder.limit(pageSize);

    return queryBuilder.getMany();
  }

  async getMaxId(): Promise<{ maxId: number }> {
    const result = await this.nftTransactionRepository.createQueryBuilder('nft_transaction')
      .select('MAX(nft_transaction.id)', 'maxId')
      .getRawOne();

    return { maxId: result.maxId || 0 };
  }
}