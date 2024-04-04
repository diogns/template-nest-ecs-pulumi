import { Inject, InternalServerErrorException, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserCommandsRepository } from '@user/domain/repositories/user';
import { UserCommandsImplement } from '@user/infrastructure/repositories/user';
import { ListUsersResponseDTO } from '@user/interfaces/http/v1/list-users/dto/list-users.response';
import { RemoveUserResponseDTO } from '@user/interfaces/http/v1/remove-user/dto/remove-user.response';

export class RemoveUserCommand {
  constructor(readonly userCode: number) {}
}

@CommandHandler(RemoveUserCommand)
export class RemoveUserHandler
  implements ICommandHandler<RemoveUserCommand, RemoveUserResponseDTO>
{
  constructor(
    @Inject(UserCommandsImplement)
    private readonly userRepository: UserCommandsRepository,
    private readonly logger: Logger,
  ) {}

  async execute(command: RemoveUserCommand): Promise<RemoveUserResponseDTO> {
    const result = await this.userRepository.removeUser(command.userCode);
    if (result.isErr()) {
      this.logger.warn(result.error, 'RemoveUserHandler.execute');
      throw new InternalServerErrorException(
        result.error.message,
        result.error.code,
      );
    }

    const data = result.value;

    return new RemoveUserResponseDTO(
      true,
      new ListUsersResponseDTO(
        data.userCode,
        data.userName,
        data.userLastName,
        data.userEmail,
      ),
    );
  }
}
