import { Inject, InternalServerErrorException, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserCommandsRepository } from '@user/domain/repositories/user';
import { UserCommandsImplement } from '@user/infrastructure/repositories/user';
import { ListUsersResponseDTO } from '@user/interfaces/http/v1/list-users/dto/list-users.response';
import { UpdateUserEmailResponseDTO } from '@user/interfaces/http/v1/update-user-email/dto/update-user-email.response';

export class UpdateUserEmailCommand {
  constructor(
    readonly userCode: number,
    readonly userEmail: string,
  ) {}
}

@CommandHandler(UpdateUserEmailCommand)
export class UpdateUserEmailHandler
  implements
    ICommandHandler<UpdateUserEmailCommand, UpdateUserEmailResponseDTO>
{
  constructor(
    @Inject(UserCommandsImplement)
    private readonly userRepository: UserCommandsRepository,
    private readonly logger: Logger,
  ) {}

  async execute(
    command: UpdateUserEmailCommand,
  ): Promise<UpdateUserEmailResponseDTO> {
    const result = await this.userRepository.updateUserEmail(
      command.userCode,
      command.userEmail,
    );
    if (result.isErr()) {
      this.logger.warn(result.error, 'UpdateUserEmailHandler.execute');
      throw new InternalServerErrorException(
        result.error.message,
        result.error.code,
      );
    }

    const data = result.value;

    return new UpdateUserEmailResponseDTO(
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
