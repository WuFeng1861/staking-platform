import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { INestApplication } from '@nestjs/common';
import { Referral } from '../../src/modules/referral/entities/referral.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ReferralController (e2e)', () => {
  let app: INestApplication;
  let referralRepository: Repository<Referral>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    referralRepository = moduleFixture.get<Repository<Referral>>(
      getRepositoryToken(Referral),
    );

    // Clear the database before each test
    await referralRepository.query('DELETE FROM referrals;');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /referral/bind', () => {
    beforeEach(async () => {
      // Clear data before each test to avoid conflicts
      await referralRepository.query('DELETE FROM referrals;');
    });

    it('should bind referrer successfully', async () => {
      const bindDto = {
        currentAddress: '0x123456789abcdef',
        referrerAddress: '0x987654321fedcba',
        chainId: '1',
        chainName: 'Ethereum',
        transactionHash: '0xtest123456789',
      };

      const response = await request(app.getHttpServer())
        .post('/referral/bind')
        .send(bindDto)
        .expect(201);

      expect(response.body).toHaveProperty('code', 0);
      expect(response.body).toHaveProperty('message', '操作成功');
      expect(response.body.data).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('message', '绑定上级成功');
    });

    it('should return 400 if required fields are missing', async () => {
      const bindDto = {
        currentAddress: '0xUNIQUE111111111',
        referrerAddress: '0xUNIQUE222222222',
        chainId: '1',
        // Missing chainName and transactionHash
      };

      await request(app.getHttpServer())
        .post('/referral/bind')
        .send(bindDto)
        .expect(400);
    });

    it('should return 400 when binding self as referrer', async () => {
      const bindDto = {
        currentAddress: '0xSELF333333333333',
        referrerAddress: '0xSELF333333333333', // Same as current address
        chainId: '1',
        chainName: 'Ethereum',
        transactionHash: '0xtest987654321',
      };

      await request(app.getHttpServer())
        .post('/referral/bind')
        .send(bindDto)
        .expect(400);
    });
  });

  describe('GET /referral/subordinates/count', () => {
    beforeEach(async () => {
      // Clear and seed data for query tests
      await referralRepository.query('DELETE FROM referrals;');
      await referralRepository.save([
        {
          id: 1,
          currentAddress: '0xAAA111',
          referrerAddress: '0xREFERRER1',
          chainId: '1',
          chainName: 'Ethereum',
          transactionHash: '0xhash1',
        },
        {
          id: 2,
          currentAddress: '0xAAA222',
          referrerAddress: '0xREFERRER1',
          chainId: '1',
          chainName: 'Ethereum',
          transactionHash: '0xhash2',
        },
      ]);
    });

    it('should return subordinates count for specific chain', async () => {
      const response = await request(app.getHttpServer())
        .get('/referral/subordinates/count?address=0xREFERRER1&chainId=1')
        .expect(200);

      expect(response.body).toHaveProperty('code', 0);
      expect(response.body).toHaveProperty('message', '操作成功');
      expect(response.body.data).toHaveProperty('count', 2);
    });

    it('should return 400 if address parameter is missing', async () => {
      await request(app.getHttpServer())
        .get('/referral/subordinates/count')
        .expect(400);
    });
  });
});