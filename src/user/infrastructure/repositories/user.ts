import { Inject, Logger } from '@nestjs/common';
import { UserEntity } from '@user/domain/entities/user.entity';
import {
  AddUserResult,
  GetUserByCodeResult,
  ListUsersResult,
  UserCommandsRepository,
  UserQueriesRepository,
} from '@user/domain/repositories/user';
import { err, ok } from 'neverthrow';
import {
  AddUserDatabaseException,
  ListUsersDatabaseException,
  RemoveUserDatabaseException,
  UpdateUserDatabaseException,
  UpdateUserEmailDatabaseException,
} from '../exceptions/user.exception';

let userDataBase: UserEntity[] = [];

export class UserQueriesImplement implements UserQueriesRepository {
  @Inject()
  private readonly logger: Logger;

  async listUsers(): Promise<ListUsersResult> {
    try {
      return ok(userDataBase);
    } catch (error) {
      this.logger.error(error, 'UserQueriesImplement.listUsers');
      return err(new ListUsersDatabaseException());
    }
  }

  async getUserByCode(userCode: number): Promise<GetUserByCodeResult> {
    try {
      const user = userDataBase.find((item) => item.userCode == userCode);
      return ok(user);
    } catch (error) {
      this.logger.error(error, 'UserQueriesImplement.listUsers');
      return err(new ListUsersDatabaseException());
    }
  }
}

export class UserCommandsImplement implements UserCommandsRepository {
  @Inject()
  private readonly logger: Logger;

  async addUser(user: UserEntity): Promise<AddUserResult> {
    try {
      const newUser = new UserEntity(
        userDataBase.length + 1,
        user.userName,
        user.userLastName,
        user.userEmail,
      );
      userDataBase.push(newUser);
      return ok(newUser);
    } catch (error) {
      this.logger.error(error, 'UserCommandsImplement.addUser');
      return err(new AddUserDatabaseException());
    }
  }

  async updateUser(user: UserEntity): Promise<AddUserResult> {
    try {
      const userUpdate = userDataBase.find(
        (item) => item.userCode === user.userCode,
      );
      userUpdate.userName = user.userName;
      userUpdate.userLastName = user.userLastName;
      userUpdate.userEmail = user.userEmail;
      return ok(userUpdate);
    } catch (error) {
      this.logger.error(error, 'UserCommandsImplement.updateUser');
      return err(new UpdateUserDatabaseException());
    }
  }

  async updateUserEmail(
    userCode: number,
    userEmail: string,
  ): Promise<AddUserResult> {
    try {
      const userUpdate = userDataBase.find((item) => item.userCode == userCode);
      userUpdate.userEmail = userEmail;
      return ok(userUpdate);
    } catch (error) {
      this.logger.error(error, 'UserCommandsImplement.updateUserEmail');
      return err(new UpdateUserEmailDatabaseException());
    }
  }

  async removeUser(userCode: number): Promise<AddUserResult> {
    try {
      const userDelete = userDataBase.find((item) => item.userCode == userCode);
      userDataBase = userDataBase.filter((item) => item.userCode != userCode);
      return ok(userDelete);
    } catch (error) {
      this.logger.error(error, 'UserCommandsImplement.deleteUser');
      return err(new RemoveUserDatabaseException());
    }
  }
}
