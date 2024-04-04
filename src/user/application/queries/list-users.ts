import { Inject, InternalServerErrorException, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserQueriesRepository } from '@user/domain/repositories/user';
import { UserQueriesImplement } from '@user/infrastructure/repositories/user';
import { ListUsersResponseDTO } from '@user/interfaces/http/v1/list-users/dto/list-users.response';

export class ListUsersQuery {
  constructor() {}
}

@QueryHandler(ListUsersQuery)
export class ListUsersHandler
  implements IQueryHandler<ListUsersQuery, ListUsersResponseDTO[]>
{
  constructor(
    @Inject(UserQueriesImplement)
    private readonly userQuery: UserQueriesRepository,
    private readonly logger: Logger,
  ) {}

  async execute(): Promise<ListUsersResponseDTO[]> {
    const result = await this.userQuery.listUsers();
    if (result.isErr()) {
      this.logger.warn(result.error, 'ListUsersHandler.execute');
      throw new InternalServerErrorException(
        result.error.message,
        result.error.code,
      );
    }

    const users = result.value;

    return users.map(
      (item) =>
        new ListUsersResponseDTO(
          item.userCode,
          item.userName,
          item.userLastName,
          item.userEmail,
        ),
    );
  }
}
