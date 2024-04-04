import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from '@user/domain/entities/user.entity';
import { UserQueriesRepository } from '@user/domain/repositories/user';
import { GetUserByCodeDatabaseException } from '@user/infrastructure/exceptions/user.exception';
import { UserModule } from '@user/infrastructure/nestjs/user.module';
import { UserQueriesImplement } from '@user/infrastructure/repositories/user';
import { err, ok } from 'neverthrow';
import * as request from 'supertest';

let moduleRef: TestingModule;
let app: INestApplication;
let userQuery: UserQueriesRepository;

describe('GetUserByCodeController (e2e)', () => {
  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('getUserByCode', () => {
    beforeEach(async () => {
      userQuery = moduleRef.get<UserQueriesImplement>(UserQueriesImplement);
    });

    afterEach(async () => {
      jest.restoreAllMocks();
    });

    it('should return status code 500', async () => {
      // Arrange
      jest
        .spyOn(userQuery, 'getUserByCode')
        .mockImplementation(async () =>
          err(new GetUserByCodeDatabaseException()),
        );

      // Act
      const response = request(app.getHttpServer()).get('/user/1');

      // Assert
      await response.expect(500).then((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain(
          GetUserByCodeDatabaseException.getMessage(),
        );
      });
    });

    it('should return status code 200', async () => {
      // Arrange
      jest
        .spyOn(userQuery, 'getUserByCode')
        .mockImplementation(async () => ok(new UserEntity(1, '', '', '')));

      // Act
      const response = request(app.getHttpServer()).get('/user/1');

      // Assert
      await response.expect(200).then((res) => {
        expect(res.body).not.toBeNull();
      });
    });
  });
});
