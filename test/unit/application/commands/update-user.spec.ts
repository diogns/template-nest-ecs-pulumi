import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  UpdateUserCommand,
  UpdateUserHandler,
} from '@user/application/commands/update-user';
import { UserEntity } from '@user/domain/entities/user.entity';
import { UserCommandsRepository } from '@user/domain/repositories/user';
import { UpdateUserDatabaseException } from '@user/infrastructure/exceptions/user.exception';
import { UserModule } from '@user/infrastructure/nestjs/user.module';
import { UserCommandsImplement } from '@user/infrastructure/repositories/user';
import { err, ok } from 'neverthrow';

let moduleRef: TestingModule;
let updateUserHandler: UpdateUserHandler;
let userCommand: UserCommandsRepository;

describe('UpdateUserHandler.execute', () => {
  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();
  });

  beforeEach(async () => {
    updateUserHandler = moduleRef.get<UpdateUserHandler>(UpdateUserHandler);
    userCommand = moduleRef.get<UserCommandsImplement>(UserCommandsImplement);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  it('should throw an InternalServerErrorException when repository return a database error', async () => {
    // Arrange
    jest
      .spyOn(userCommand, 'updateUser')
      .mockImplementation(async () => err(new UpdateUserDatabaseException()));

    //Act
    let exception: Error;
    try {
      const command = new UpdateUserCommand(1, '', '', '');
      await updateUserHandler.execute(command);
    } catch (error) {
      exception = error;
    }

    // Assert
    expect(exception).toBeInstanceOf(InternalServerErrorException);
    expect(exception.message).toBe(UpdateUserDatabaseException.getMessage());
  });

  it('should throw ok with UpdateUserResponseDTO when repository return success', async () => {
    // Arrange
    jest.spyOn(userCommand, 'updateUser').mockImplementation(async () => {
      return ok(new UserEntity(1, '', '', ''));
    });

    //Act
    const command = new UpdateUserCommand(1, '', '', '');
    const response = await updateUserHandler.execute(command);

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
