import { Body, Controller, Param, Patch, Version } from '@nestjs/common';
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
import { UpdateUserEmailResponseDTO } from './dto/update-user-email.response';
import { UpdateUserEmailRequestDTO } from './dto/update-user-email.request';
import { UpdateUserEmailCommand } from '@user/application/commands/update-user-email';

@ApiTags('User')
@Controller('user')
export class UpdateUserEmailController {
  constructor(readonly commandBus: CommandBus) {}

  @Version('1')
  @Patch(':user_code/email')
  @ApiOkResponse({
    description: ResponseDescription.OK,
    type: UpdateUserEmailResponseDTO,
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
  async updateUserEmail(
    @Param('user_code') user_code: number,
    @Body() user: UpdateUserEmailRequestDTO,
  ) {
    const query = new UpdateUserEmailCommand(user_code, user.user_email);
    return this.commandBus.execute(query);
  }
}
