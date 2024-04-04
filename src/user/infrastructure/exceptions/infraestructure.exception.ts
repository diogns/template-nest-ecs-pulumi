export enum InfrastructureExceptionCode {
  Default = 'DEFAULT_INFRA_EXCEPTION',
  ListUsersDatabaseExceptionCode = 'LIST_USERS_DATABASE_EXCEPTION',
  AddUserDatabaseExceptionCode = 'ADD_USER_DATABASE_EXCEPTION',
  UpdateUserDatabaseExceptionCode = 'UPDATE_USER_DATABASE_EXCEPTION',
  UpdateUserEmailDatabaseExceptionCode = 'UPDATE_USER_EMAIL_DATABASE_EXCEPTION',
  RemoveUserDatabaseExceptionCode = 'REMOVE_USER_DATABASE_EXCEPTION',
  GetUserByCodeDatabaseExceptionCode = 'GET_USER_BY_CODE_DATABASE_EXCEPTION',
}

export abstract class InfrastructureException extends Error {
  code: string;

  constructor(message?: string) {
    super(message);

    this.code = InfrastructureExceptionCode.Default;
  }
}
