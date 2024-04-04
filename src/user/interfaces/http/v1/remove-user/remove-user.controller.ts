import { Controller, Delete, Param, Version } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseDescription } from '../response-description';
import { GeneralResponse } from '../../general.response';
import { RemoveUserCommand } from '@user/application/commands/remove-user';
import { RemoveUserResponseDTO } from './dto/remove-user.response';

@ApiTags('User')
@Controller('user')
export class RemoveUserController {
  constructor(readonly commandBus: CommandBus) {}

  @Version('1')
  @Delete(':user_code')
  @ApiOkResponse({
    description: ResponseDescription.OK,
    type: RemoveUserResponseDTO,
  })
  @ApiBadRequestResponse({
    description: ResponseDescription.BAD_REQUEST,
    type: GeneralResponse,
  })
  @ApiInternalServerErrorResponse({
    description: ResponseDescription.INTERNAL_SERVER_ERROR,
    type: GeneralResponse,
  })
  @ApiParam({
    name: 'user_code',
    required: true,
    type: Number,
    description: 'User code',
  })
  async removeUser(@Param('user_code') user_code: number) {
    const query = new RemoveUserCommand(user_code);
    return this.commandBus.execute(query);
  }
}
