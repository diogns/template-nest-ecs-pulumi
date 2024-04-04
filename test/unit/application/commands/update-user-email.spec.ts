import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  UpdateUserEmailCommand,
  UpdateUserEmailHandler,
} from '@user/application/commands/update-user-email';
import { UserEntity } from '@user/domain/entities/user.entity';
import { UserCommandsRepository } from '@user/domain/repositories/user';
import { UpdateUserEmailDatabaseException } from '@user/infrastructure/exceptions/user.exception';
import { UserModule } from '@user/infrastructure/nestjs/user.module';
import { UserCommandsImplement } from '@user/infrastructure/repositories/user';
import { err, ok } from 'neverthrow';

let moduleRef: TestingModule;
let updateUserEmailHandler: UpdateUserEmailHandler;
let userCommand: UserCommandsRepository;

describe('UpdateUserEmailHandler.execute', () => {
  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();
  });

  beforeEach(async () => {
    updateUserEmailHandler = moduleRef.get<UpdateUserEmailHandler>(
      UpdateUserEmailHandler,
    );
    userCommand = moduleRef.get<UserCommandsImplement>(UserCommandsImplement);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  it('should throw an InternalServerErrorException when repository return a database error', async () => {
    // Arrange
    jest
      .spyOn(userCommand, 'updateUserEmail')
      .mockImplementation(async () =>
        err(new UpdateUserEmailDatabaseException()),
      );

    //Act
    let exception: Error;
    try {
      const command = new UpdateUserEmailCommand(1, 'correo@prueba.com');
      await updateUserEmailHandler.execute(command);
    } catch (error) {
      exception = error;
    }

    // Assert
    expect(exception).toBeInstanceOf(InternalServerErrorException);
    expect(exception.message).toBe(
      UpdateUserEmailDatabaseException.getMessage(),
    );
  });

  it('should throw ok with UpdateUserEmailResponseDTO when repository return success', async () => {
    // Arrange
    jest.spyOn(userCommand, 'updateUserEmail').mockImplementation(async () => {
      return ok(new UserEntity(1, '', '', ''));
    });

    //Act
    const command = new UpdateUserEmailCommand(1, 'prueba@correo.com');
    const response = await updateUserEmailHandler.execute(command);

    // Assert
    expect(response).not.toBeNull();
    expect(response.success).toBe(true);
    expect(Object.keys(response.user)).toEqual(
      expect.arrayContaining([
        'user_code',
        'user_name',
        'user_lastname',
        'user_email',
      ]),
    );
  });
});
