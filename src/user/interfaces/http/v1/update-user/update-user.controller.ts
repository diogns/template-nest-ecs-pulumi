import { Body, Controller, Put, Version } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseDescription } from '../response-description';
import { GeneralResponse } from '../../general.response';
import { UpdateUserResponseDTO } from './dto/update-user.response';
import { UpdateUserRequestDTO } from './dto/update-user.request';
import { UpdateUserCommand } from '@user/application/commands/update-user';

@ApiTags('User')
@Controller('user')
export class UpdateUserController {
  constructor(readonly commandBus: CommandBus) {}

  @Version('1')
  @Put()
  @ApiOkResponse({
    description: ResponseDescription.OK,
    type: UpdateUserResponseDTO,
  })
  @ApiBadRequestResponse({
    description: ResponseDescription.BAD_REQUEST,
    type: GeneralResponse,
  })
  @ApiInternalServerErrorResponse({
    description: ResponseDescription.INTERNAL_SERVER_ERROR,
    type: GeneralResponse,
  })
  async updateUser(@Body() user: UpdateUserRequestDTO) {
    const query = new UpdateUserCommand(
      user.user_code,
      user.user_name,
      user.user_lastname,
      user.user_email,
    );
    return this.commandBus.execute(query);
  }
}
