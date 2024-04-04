import { Inject, InternalServerErrorException, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserEntity } from '@user/domain/entities/user.entity';
import { UserCommandsRepository } from '@user/domain/repositories/user';
import { UserCommandsImplement } from '@user/infrastructure/repositories/user';
import { AddUserResponseDTO } from '@user/interfaces/http/v1/add-user/dto/add-user.response';
import { ListUsersResponseDTO } from '@user/interfaces/http/v1/list-users/dto/list-users.response';

export class AddUserCommand {
  constructor(
    readonly userName: string,
    readonly userLastName: string,
    readonly userEmail: string,
  ) {}
}

@CommandHandler(AddUserCommand)
export class AddUserHandler
  implements ICommandHandler<AddUserCommand, AddUserResponseDTO>
{
  constructor(
    @Inject(UserCommandsImplement)
    private readonly userRepository: UserCommandsRepository,
    private readonly logger: Logger,
  ) {}

  async execute(command: AddUserCommand): Promise<AddUserResponseDTO> {
    const userEntity = new UserEntity(
      0,
      command.userName,
      command.userLastName,
      command.userEmail,
    );
    const result = await this.userRepository.addUser(userEntity);
    if (result.isErr()) {
      this.logger.warn(result.error, 'AddUserHandler.execute');
      throw new InternalServerErrorException(
        result.error.message,
        result.error.code,
      );
    }

    const data = result.value;

    return new AddUserResponseDTO(
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
