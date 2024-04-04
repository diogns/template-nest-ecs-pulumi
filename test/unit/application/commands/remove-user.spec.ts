import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  RemoveUserCommand,
  RemoveUserHandler,
} from '@user/application/commands/remove-user';
import { UserEntity } from '@user/domain/entities/user.entity';
import { UserCommandsRepository } from '@user/domain/repositories/user';
import { RemoveUserDatabaseException } from '@user/infrastructure/exceptions/user.exception';
import { UserModule } from '@user/infrastructure/nestjs/user.module';
import { UserCommandsImplement } from '@user/infrastructure/repositories/user';
import { err, ok } from 'neverthrow';

let moduleRef: TestingModule;
let removeUserHandler: RemoveUserHandler;
let userCommand: UserCommandsRepository;

describe('RemoveUserHandler.execute', () => {
  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();
  });

  beforeEach(async () => {
    removeUserHandler = moduleRef.get<RemoveUserHandler>(RemoveUserHandler);
    userCommand = moduleRef.get<UserCommandsImplement>(UserCommandsImplement);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  it('should throw an InternalServerErrorException when repository return a database error', async () => {
    // Arrange
    jest
      .spyOn(userCommand, 'removeUser')
      .mockImplementation(async () => err(new RemoveUserDatabaseException()));

    //Act
    let exception: Error;
    try {
      const command = new RemoveUserCommand(1);
      await removeUserHandler.execute(command);
    } catch (error) {
      exception = error;
    }

    // Assert
    expect(exception).toBeInstanceOf(InternalServerErrorException);
    expect(exception.message).toBe(RemoveUserDatabaseException.getMessage());
  });

  it('should throw ok with RemoveUserResponseDTO when repository return success', async () => {
    // Arrange
    jest.spyOn(userCommand, 'removeUser').mockImplementation(async () => {
      return ok(new UserEntity(1, '', '', ''));
    });

    //Act
    const command = new RemoveUserCommand(1);
    const response = await removeUserHandler.execute(command);

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
