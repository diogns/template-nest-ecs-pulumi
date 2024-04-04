import {
  InfrastructureException,
  InfrastructureExceptionCode,
} from './infraestructure.exception';

export class ListUsersDatabaseException extends InfrastructureException {
  code: string;
  constructor() {
    super(ListUsersDatabaseException.getMessage());
    this.code = InfrastructureExceptionCode.ListUsersDatabaseExceptionCode;
  }
  static getMessage(): string {
    return 'There was an error in the database when listing users';
  }
}

export class GetUserByCodeDatabaseException extends InfrastructureException {
  code: string;
  constructor() {
    super(GetUserByCodeDatabaseException.getMessage());
    this.code = InfrastructureExceptionCode.GetUserByCodeDatabaseExceptionCode;
  }
  static getMessage(): string {
    return 'There was an error in the database when getting user by code';
  }
}

export class AddUserDatabaseException extends InfrastructureException {
  code: string;
  constructor() {
    super(AddUserDatabaseException.getMessage());
    this.code = InfrastructureExceptionCode.AddUserDatabaseExceptionCode;
  }
  static getMessage(): string {
    return 'There was an error in the database when add user';
  }
}

export class UpdateUserDatabaseException extends InfrastructureException {
  code: string;
  constructor() {
    super(UpdateUserDatabaseException.getMessage());
    this.code = InfrastructureExceptionCode.UpdateUserDatabaseExceptionCode;
  }
  static getMessage(): string {
    return 'There was an error in the database when update user';
  }
}

export class UpdateUserEmailDatabaseException extends InfrastructureException {
  code: string;
  constructor() {
    super(UpdateUserEmailDatabaseException.getMessage());
    this.code =
      InfrastructureExceptionCode.UpdateUserEmailDatabaseExceptionCode;
  }
  static getMessage(): string {
    return 'There was an error in the database when update user email';
  }
}

export class RemoveUserDatabaseException extends InfrastructureException {
  code: string;
  constructor() {
    super(RemoveUserDatabaseException.getMessage());
    this.code = InfrastructureExceptionCode.RemoveUserDatabaseExceptionCode;
  }
  static getMessage(): string {
    return 'There was an error in the database when remove user';
  }
}
