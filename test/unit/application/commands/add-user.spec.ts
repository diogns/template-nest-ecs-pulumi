import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  AddUserCommand,
  AddUserHandler,
} from '@user/application/commands/add-user';
import { UserEntity } from '@user/domain/entities/user.entity';
import { UserCommandsRepository } from '@user/domain/repositories/user';
import { AddUserDatabaseException } from '@user/infrastructure/exceptions/user.exception';
import { UserModule } from '@user/infrastructure/nestjs/user.module';
import { UserCommandsImplement } from '@user/infrastructure/repositories/user';
import { err, ok } from 'neverthrow';

let moduleRef: TestingModule;
let addUserHandler: AddUserHandler;
let userCommand: UserCommandsRepository;

describe('AddUserHandler.execute', () => {
  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();
  });

  beforeEach(async () => {
    addUserHandler = moduleRef.get<AddUserHandler>(AddUserHandler);
    userCommand = moduleRef.get<UserCommandsImplement>(UserCommandsImplement);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  it('should throw an InternalServerErrorException when repository return a database error', async () => {
    // Arrange
    jest
      .spyOn(userCommand, 'addUser')
      .mockImplementation(async () => err(new AddUserDatabaseException()));

    //Act
    let exception: Error;
    try {
      const command = new AddUserCommand('', '', '');
      await addUserHandler.execute(command);
    } catch (error) {
      exception = error;
    }

    // Assert
    expect(exception).toBeInstanceOf(InternalServerErrorException);
    expect(exception.message).toBe(AddUserDatabaseException.getMessage());
  });

  it('should throw ok with AddUserResponseDTO when repository return success', async () => {
    // Arrange
    jest.spyOn(userCommand, 'addUser').mockImplementation(async () => {
      return ok(new UserEntity(1, '', '', ''));
    });

    //Act
    const command = new AddUserCommand('', '', '');
    const response = await addUserHandler.execute(command);

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
