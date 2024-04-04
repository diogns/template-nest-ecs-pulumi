import { Inject, InternalServerErrorException, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserNotFoundException } from '@user/domain/exceptions/user.exception';
import { UserQueriesRepository } from '@user/domain/repositories/user';
import { UserQueriesImplement } from '@user/infrastructure/repositories/user';
import { ListUsersResponseDTO } from '@user/interfaces/http/v1/list-users/dto/list-users.response';

export class GetUserByCodeQuery {
  constructor(readonly userCode: number) {}
}

@QueryHandler(GetUserByCodeQuery)
export class GetUserByCodeHandler
  implements IQueryHandler<GetUserByCodeQuery, ListUsersResponseDTO>
{
  constructor(
    @Inject(UserQueriesImplement)
    private readonly userQuery: UserQueriesRepository,
    private readonly logger: Logger,
  ) {}

  async execute(query: GetUserByCodeQuery): Promise<ListUsersResponseDTO> {
    const result = await this.userQuery.getUserByCode(query.userCode);
    if (result.isErr()) {
      this.logger.warn(result.error, 'GetUserByCodeHandler.execute');
      throw new InternalServerErrorException(
        result.error.message,
        result.error.code,
      );
    }

    const users = result.value;
    if (!users) throw new UserNotFoundException();

    return new ListUsersResponseDTO(
      users.userCode,
      users.userName,
      users.userLastName,
      users.userEmail,
    );
  }
}
