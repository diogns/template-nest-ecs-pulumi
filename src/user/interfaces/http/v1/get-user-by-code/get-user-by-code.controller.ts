import { Controller, Get, Param, Version } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseDescription } from '../response-description';
import { GeneralResponse } from '../../general.response';
import { ListUsersResponseDTO } from '../list-users/dto/list-users.response';
import { GetUserByCodeQuery } from '@user/application/queries/get-user-by-code';

@ApiTags('User')
@Controller('user')
export class GetUserByCodeController {
  constructor(readonly queryBus: QueryBus) {}

  @Version('1')
  @Get(':user_code')
  @ApiOkResponse({
    description: ResponseDescription.OK,
    type: ListUsersResponseDTO,
  })
  @ApiNotFoundResponse({
    description: ResponseDescription.NOT_FOUND,
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
  async getUserByCode(@Param('user_code') user_code: number) {
    const query = new GetUserByCodeQuery(user_code);
    return this.queryBus.execute(query);
  }
}
