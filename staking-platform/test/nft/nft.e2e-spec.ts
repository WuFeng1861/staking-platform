import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { INestApplication } from '@nestjs/common';
import { NftTransaction } from '../../src/modules/nft/entities/nft-transaction.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('NftController (e2e)', () => {
  let app: INestApplication;
  let nftTransactionRepository: Repository<NftTransaction>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    nftTransactionRepository = moduleFixture.get<Repository<NftTransaction>>(
      getRepositoryToken(NftTransaction),
    );

    // Clear the database before each test
    await nftTransactionRepository.query('DELETE FROM nft_transaction;');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /nft/transaction', () => {
    it('should create a new NFT transaction', async () => {
      const createDto = {
        transactionHash: '0x123456789abcdef',
        stakingCoin: 'ETH',
        stakingAmount: '10.5',
        stakingStartTime: new Date().toISOString(),
        stakingMinDuration: 30,
        stakingApr: '0.05',
        fromAddress: '0xabc',
        toAddress: '0xdef',
        stakingChain: 'Ethereum',
      };

      const response = await request(app.getHttpServer())
        .post('/nft/transaction')
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.transactionHash).toEqual(createDto.transactionHash);
      expect(response.body.fromAddress).toEqual(createDto.fromAddress);
      expect(response.body.toAddress).toEqual(createDto.toAddress);
    });

    it('should return 400 if required fields are missing', async () => {
      const createDto = {
        transactionHash: '0x123456789abcdef',
        stakingCoin: 'ETH',
        stakingAmount: '10.5',
        // Missing stakingStartTime
        stakingMinDuration: 30,
        stakingApr: '0.05',
        fromAddress: '0xabc',
        toAddress: '0xdef',
        stakingChain: 'Ethereum',
      };

      await request(app.getHttpServer())
        .post('/nft/transaction')
        .send(createDto)
        .expect(400);
    });
  });

  describe('GET /nft/transactions', () => {
    beforeEach(async () => {
      // Clear and seed data for query tests
      await nftTransactionRepository.query('DELETE FROM nft_transaction;');
      await nftTransactionRepository.save([
        { id: 101, transactionHash: '0x1_query', stakingCoin: 'ETH', stakingAmount: '1', stakingStartTime: new Date().toISOString(), stakingMinDuration: 10, stakingApr: '0.01', fromAddress: '0xAAA', toAddress: '0xBBB', stakingChain: 'Ethereum' },
        { id: 102, transactionHash: '0x2_query', stakingCoin: 'USDT', stakingAmount: '2', stakingStartTime: new Date().toISOString(), stakingMinDuration: 20, stakingApr: '0.02', fromAddress: '0xBBB', toAddress: '0xCCC', stakingChain: 'BSC' },
        { id: 103, transactionHash: '0x3_query', stakingCoin: 'BTC', stakingAmount: '3', stakingStartTime: new Date().toISOString(), stakingMinDuration: 30, stakingApr: '0.03', fromAddress: '0xAAA', toAddress: '0xCCC', stakingChain: 'Polygon' },
      ]);
    });

    it('should return transactions for a given address (fromAddress)', async () => {
      const response = await request(app.getHttpServer())
        .get('/nft/transactions?address=0xAAA')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.some(t => t.transactionHash === '0x1_query')).toBeTruthy();
      expect(response.body.some(t => t.transactionHash === '0x3_query')).toBeTruthy();
    });

    it('should return transactions for a given address (toAddress)', async () => {
      const response = await request(app.getHttpServer())
        .get('/nft/transactions?address=0xCCC')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.some(t => t.transactionHash === '0x2_query')).toBeTruthy();
      expect(response.body.some(t => t.transactionHash === '0x3_query')).toBeTruthy();
    });

    it('should return transactions with minId and pageSize', async () => {
      const response = await request(app.getHttpServer())
        .get('/nft/transactions?address=0xAAA&minId=102&pageSize=1')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].transactionHash).toEqual('0x1_query');
    });

    it('should return transactions with default pageSize if not provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/nft/transactions?address=0xAAA')
        .expect(200);

      expect(response.body.length).toBeLessThanOrEqual(10); // Default pageSize is 10
    });
  });

  describe('GET /nft/max-id', () => {
    beforeEach(async () => {
      await nftTransactionRepository.query('DELETE FROM nft_transaction;');
    });

    it('should return 0 if no transactions exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/nft/max-id')
        .expect(200);

      expect(response.body).toHaveProperty('maxId', 0);
    });

    it('should return the maximum ID of existing transactions', async () => {
      await nftTransactionRepository.save([
        { id: 1, transactionHash: '0x1_maxid', stakingCoin: 'ETH', stakingAmount: '1', stakingStartTime: new Date().toISOString(), stakingMinDuration: 10, stakingApr: '0.01', fromAddress: '0xAAA', toAddress: '0xBBB', stakingChain: 'Ethereum' },
        { id: 5, transactionHash: '0x2_maxid', stakingCoin: 'USDT', stakingAmount: '2', stakingStartTime: new Date().toISOString(), stakingMinDuration: 20, stakingApr: '0.02', fromAddress: '0xBBB', toAddress: '0xCCC', stakingChain: 'BSC' },
        { id: 3, transactionHash: '0x3_maxid', stakingCoin: 'BTC', stakingAmount: '3', stakingStartTime: new Date().toISOString(), stakingMinDuration: 30, stakingApr: '0.03', fromAddress: '0xAAA', toAddress: '0xCCC', stakingChain: 'Polygon' },
      ]);

      const response = await request(app.getHttpServer())
        .get('/nft/max-id')
        .expect(200);

      expect(response.body).toHaveProperty('maxId', 5);
    });
  });
});