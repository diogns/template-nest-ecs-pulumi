import { Logger, Module } from '@nestjs/common';
import { ListUsersController } from '../../interfaces/http/v1/list-users/list-users.controller';
import {
  UserCommandsImplement,
  UserQueriesImplement,
} from '../repositories/user';
import { ListUsersHandler } from '../../application/queries/list-users';
import { CqrsModule } from '@nestjs/cqrs';
import { AddUserController } from '../../interfaces/http/v1/add-user/add-user.controller';
import { AddUserHandler } from '../../application/commands/add-user';
import { UpdateUserController } from '../../interfaces/http/v1/update-user/update-user.controller';
import { UpdateUserEmailController } from '../../interfaces/http/v1/update-user-email/update-user-email.controller';
import { RemoveUserController } from '../../interfaces/http/v1/remove-user/remove-user.controller';
import { UpdateUserHandler } from '../../application/commands/update-user';
import { UpdateUserEmailHandler } from '../../application/commands/update-user-email';
import { RemoveUserHandler } from '../../application/commands/remove-user';
import { GetUserByCodeHandler } from '../../application/queries/get-user-by-code';
import { GetUserByCodeController } from '../../interfaces/http/v1/get-user-by-code/get-user-by-code.controller';

const controllers = [
  ListUsersController,
  GetUserByCodeController,
  AddUserController,
  UpdateUserController,
  UpdateUserEmailController,
  RemoveUserController,
];

const infrastructure = [UserQueriesImplement, UserCommandsImplement];

const domain = [];

const application = [
  ListUsersHandler,
  GetUserByCodeHandler,
  AddUserHandler,
  UpdateUserHandler,
  UpdateUserEmailHandler,
  RemoveUserHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [...controllers],
  providers: [Logger, ...infrastructure, ...application, ...domain],
})
export class UserModule {}
