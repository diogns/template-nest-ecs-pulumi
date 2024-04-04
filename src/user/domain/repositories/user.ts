import { Result } from 'neverthrow';
import { UserEntity } from '../entities/user.entity';
import {
  AddUserDatabaseException,
  GetUserByCodeDatabaseException,
  ListUsersDatabaseException,
  RemoveUserDatabaseException,
  UpdateUserDatabaseException,
  UpdateUserEmailDatabaseException,
} from '@user/infrastructure/exceptions/user.exception';

export type ListUsersResult = Result<
  UserEntity[] | null,
  ListUsersDatabaseException
>;

export type GetUserByCodeResult = Result<
  UserEntity | null,
  GetUserByCodeDatabaseException
>;

export interface UserQueriesRepository {
  listUsers: () => Promise<ListUsersResult>;
  getUserByCode: (userCode: number) => Promise<GetUserByCodeResult>;
}

export type AddUserResult = Result<UserEntity | null, AddUserDatabaseException>;
export type updateUserResult = Result<
  UserEntity | null,
  UpdateUserDatabaseException
>;
export type updateUserEmailResult = Result<
  UserEntity | null,
  UpdateUserEmailDatabaseException
>;
export type removeUserResult = Result<
  UserEntity | null,
  RemoveUserDatabaseException
>;

export interface UserCommandsRepository {
  addUser: (user: UserEntity) => Promise<AddUserResult>;
  updateUser: (user: UserEntity) => Promise<AddUserResult>;
  updateUserEmail: (
    userCode: number,
    userEmail: string,
  ) => Promise<AddUserResult>;
  removeUser: (userCode: number) => Promise<AddUserResult>;
}
