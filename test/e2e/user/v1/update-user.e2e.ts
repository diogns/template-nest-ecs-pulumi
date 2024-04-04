import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from '@user/domain/entities/user.entity';
import { UserCommandsRepository } from '@user/domain/repositories/user';
import { UpdateUserDatabaseException } from '@user/infrastructure/exceptions/user.exception';
import { UserModule } from '@user/infrastructure/nestjs/user.module';
import { UserCommandsImplement } from '@user/infrastructure/repositories/user';
import { err, ok } from 'neverthrow';
import * as request from 'supertest';

let moduleRef: TestingModule;
let app: INestApplication;
let userCommand: UserCommandsRepository;

describe('UpdateUserController (e2e)', () => {
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

  describe('updateUser', () => {
    beforeEach(async () => {
      userCommand = moduleRef.get<UserCommandsImplement>(UserCommandsImplement);
    });

    afterEach(async () => {
      jest.restoreAllMocks();
    });

    it('should return status code 500', async () => {
      // Arrange
      jest
        .spyOn(userCommand, 'updateUser')
        .mockImplementation(async () => err(new UpdateUserDatabaseException()));

      // Act
      const payload = {
        user_code: 1,
        user_name: 'prueba',
        user_lastname: 'prueba',
        user_email: 'prueba@prueba.com',
      };
      const response = request(app.getHttpServer()).put('/user').send(payload);

      // Assert
      await response.expect(500).then((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain(
          UpdateUserDatabaseException.getMessage(),
        );
      });
    });

    it('should return status code 400', async () => {
      // Arrange
      jest
        .spyOn(userCommand, 'updateUser')
        .mockImplementation(async () => err(new UpdateUserDatabaseException()));

      // Act
      const payload = {
        user_code: 1,
        user_name: '',
        user_lastname: '',
        user_email: '',
      };
      const response = request(app.getHttpServer()).put('/user').send(payload);

      // Assert
      await response.expect(400).then((res) => {
        expect(res.body).toHaveProperty('message');
      });
    });

    it('should return status code 200', async () => {
      // Arrange
      jest
        .spyOn(userCommand, 'updateUser')
        .mockImplementation(async () =>
          ok(new UserEntity(1, 'prueba', 'prueba', 'prueba@prueba.com')),
        );

      // Act
      const payload = {
        user_code: 1,
        user_name: 'prueba',
        user_lastname: 'prueba',
        user_email: 'prueba@prueba.com',
      };
      const response = request(app.getHttpServer()).put('/user').send(payload);

      // Assert
      await response.expect(200).then((res) => {
        expect(res.body).not.toBeNull();
      });
    });
  });
});
