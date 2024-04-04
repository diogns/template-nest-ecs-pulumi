import { Body, Controller, Post, Version } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseDescription } from '../response-description';
import { GeneralResponse } from '../../general.response';
import { AddUserCommand } from '@user/application/commands/add-user';
import { AddUserResponseDTO } from './dto/add-user.response';
import { AddUserRequestDTO } from './dto/add-user-request';

@ApiTags('User')
@Controller('user')
export class AddUserController {
  constructor(readonly commandBus: CommandBus) {}

  @Version('1')
  @Post()
  @ApiCreatedResponse({
    description: ResponseDescription.OK,
    type: AddUserResponseDTO,
  })
  @ApiBadRequestResponse({
    description: ResponseDescription.BAD_REQUEST,
    type: GeneralResponse,
  })
  @ApiInternalServerErrorResponse({
    description: ResponseDescription.INTERNAL_SERVER_ERROR,
    type: GeneralResponse,
  })
  async addUser(@Body() user: AddUserRequestDTO) {
    const query = new AddUserCommand(
      user.user_name,
      user.user_lastname,
      user.user_email,
    );
    return this.commandBus.execute(query);
  }
}
