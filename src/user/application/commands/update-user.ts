import { Inject, InternalServerErrorException, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserEntity } from '@user/domain/entities/user.entity';
import { UserCommandsRepository } from '@user/domain/repositories/user';
import { UserCommandsImplement } from '@user/infrastructure/repositories/user';
import { ListUsersResponseDTO } from '@user/interfaces/http/v1/list-users/dto/list-users.response';
import { UpdateUserResponseDTO } from '@user/interfaces/http/v1/update-user/dto/update-user.response';

export class UpdateUserCommand {
  constructor(
    readonly userCode: number,
    readonly userName: string,
    readonly userLastName: string,
    readonly userEmail: string,
  ) {}
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler
  implements ICommandHandler<UpdateUserCommand, UpdateUserResponseDTO>
{
  constructor(
    @Inject(UserCommandsImplement)
    private readonly userRepository: UserCommandsRepository,
    private readonly logger: Logger,
  ) {}

  async execute(command: UpdateUserCommand): Promise<UpdateUserResponseDTO> {
    const userEntity = new UserEntity(
      command.userCode,
      command.userName,
      command.userLastName,
      command.userEmail,
    );
    const result = await this.userRepository.updateUser(userEntity);
    if (result.isErr()) {
      this.logger.warn(result.error, 'UpdateUserHandler.execute');
      throw new InternalServerErrorException(
        result.error.message,
        result.error.code,
      );
    }

    const data = result.value;

    return new UpdateUserResponseDTO(
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
