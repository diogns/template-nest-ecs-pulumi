import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  GetUserByCodeHandler,
  GetUserByCodeQuery,
} from '@user/application/queries/get-user-by-code';
import { UserEntity } from '@user/domain/entities/user.entity';
import { UserNotFoundException } from '@user/domain/exceptions/user.exception';
import { UserQueriesRepository } from '@user/domain/repositories/user';
import { GetUserByCodeDatabaseException } from '@user/infrastructure/exceptions/user.exception';
import { UserModule } from '@user/infrastructure/nestjs/user.module';
import { UserQueriesImplement } from '@user/infrastructure/repositories/user';
import { err, ok } from 'neverthrow';

let moduleRef: TestingModule;
let getUserByCodeHandler: GetUserByCodeHandler;
let userQuery: UserQueriesRepository;

describe('GetUserByCodeHandler.execute', () => {
  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();
  });

  beforeEach(async () => {
    getUserByCodeHandler =
      moduleRef.get<GetUserByCodeHandler>(GetUserByCodeHandler);
    userQuery = moduleRef.get<UserQueriesImplement>(UserQueriesImplement);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  it('should throw an InternalServerErrorException when repository return a database error', async () => {
    // Arrange
    jest
      .spyOn(userQuery, 'getUserByCode')
      .mockImplementation(async () =>
        err(new GetUserByCodeDatabaseException()),
      );

    //Act
    let exception: Error;
    try {
      const query = new GetUserByCodeQuery(1);
      await getUserByCodeHandler.execute(query);
    } catch (error) {
      exception = error;
    }

    // Assert
    expect(exception).toBeInstanceOf(InternalServerErrorException);
    expect(exception.message).toBe(GetUserByCodeDatabaseException.getMessage());
  });

  it('should throw an UserNotFoundException when repository return no user', async () => {
    // Arrange
    jest
      .spyOn(userQuery, 'getUserByCode')
      .mockImplementation(async () => ok(null));

    //Act
    let exception: Error;
    try {
      const query = new GetUserByCodeQuery(1);
      await getUserByCodeHandler.execute(query);
    } catch (error) {
      exception = error;
    }

    // Assert
    expect(exception).toBeInstanceOf(UserNotFoundException);
    expect(exception.message).toBe(UserNotFoundException.getMessage());
  });

  it('should throw ok with GetUserByCodeResponseDTO when repository return a user', async () => {
    // Arrange
    jest.spyOn(userQuery, 'getUserByCode').mockImplementation(async () => {
      return ok(new UserEntity(1, '', '', ''));
    });

    //Act
    const query = new GetUserByCodeQuery(1);
    const response = await getUserByCodeHandler.execute(query);

    // Assert
    expect(response).not.toBeNull();
    expect(Object.keys(response)).toEqual(
      expect.arrayContaining([
        'user_code',
        'user_name',
        'user_lastname',
        'user_email',
      ]),
    );
  });
});
