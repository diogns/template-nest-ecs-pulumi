import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ListUsersHandler } from '@user/application/queries/list-users';
import { UserEntity } from '@user/domain/entities/user.entity';
import { UserQueriesRepository } from '@user/domain/repositories/user';
import { ListUsersDatabaseException } from '@user/infrastructure/exceptions/user.exception';
import { UserModule } from '@user/infrastructure/nestjs/user.module';
import { UserQueriesImplement } from '@user/infrastructure/repositories/user';
import { err, ok } from 'neverthrow';

let moduleRef: TestingModule;
let listUsersHandler: ListUsersHandler;
let userQuery: UserQueriesRepository;

describe('ListUsersHandler.execute', () => {
  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();
  });

  beforeEach(async () => {
    listUsersHandler = moduleRef.get<ListUsersHandler>(ListUsersHandler);
    userQuery = moduleRef.get<UserQueriesImplement>(UserQueriesImplement);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  it('should throw an InternalServerErrorException when repository return a database error', async () => {
    // Arrange
    jest
      .spyOn(userQuery, 'listUsers')
      .mockImplementation(async () => err(new ListUsersDatabaseException()));

    //Act
    let exception: Error;
    try {
      await listUsersHandler.execute();
    } catch (error) {
      exception = error;
    }

    // Assert
    expect(exception).toBeInstanceOf(InternalServerErrorException);
    expect(exception.message).toBe(ListUsersDatabaseException.getMessage());
  });

  it('should throw ok with ListUsersResponseDTO when repository return users list', async () => {
    // Arrange
    const listMock = [];
    listMock.push(new UserEntity(1, '', '', ''));
    listMock.push(new UserEntity(2, '', '', ''));
    listMock.push(new UserEntity(3, '', '', ''));

    jest.spyOn(userQuery, 'listUsers').mockImplementation(async () => {
      return ok(listMock);
    });

    //Act
    const response = await listUsersHandler.execute();

    // Assert
    expect(response.length).toEqual(listMock.length);
    expect(Object.keys(response[0])).toEqual(
      expect.arrayContaining([
        'user_code',
        'user_name',
        'user_lastname',
        'user_email',
      ]),
    );
  });
});
