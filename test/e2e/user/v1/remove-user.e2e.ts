import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from '@user/domain/entities/user.entity';
import { UserCommandsRepository } from '@user/domain/repositories/user';
import { RemoveUserDatabaseException } from '@user/infrastructure/exceptions/user.exception';
import { UserModule } from '@user/infrastructure/nestjs/user.module';
import { UserCommandsImplement } from '@user/infrastructure/repositories/user';
import { err, ok } from 'neverthrow';
import * as request from 'supertest';

let moduleRef: TestingModule;
let app: INestApplication;
let userCommand: UserCommandsRepository;

describe('AddUserController (e2e)', () => {
  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('removeUser', () => {
    beforeEach(async () => {
      userCommand = moduleRef.get<UserCommandsImplement>(UserCommandsImplement);
    });

    afterEach(async () => {
      jest.restoreAllMocks();
    });

    it('should return status code 500', async () => {
      // Arrange
      jest
        .spyOn(userCommand, 'removeUser')
        .mockImplementation(async () => err(new RemoveUserDatabaseException()));

      // Act
      const response = request(app.getHttpServer()).delete('/user/1');

      // Assert
      await response.expect(500).then((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain(
          RemoveUserDatabaseException.getMessage(),
        );
      });
    });

    it('should return status code 200', async () => {
      // Arrange
      jest
        .spyOn(userCommand, 'removeUser')
        .mockImplementation(async () =>
          ok(new UserEntity(1, 'prueba', 'prueba', 'prueba@prueba.com')),
        );

      // Act
      const response = request(app.getHttpServer()).delete('/user/1');

      // Assert
      await response.expect(200).then((res) => {
        expect(res.body).not.toBeNull();
      });
    });
  });
});
