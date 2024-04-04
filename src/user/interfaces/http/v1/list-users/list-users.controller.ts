import { Controller, Get, Version } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseDescription } from '../response-description';
import { GeneralResponse } from '../../general.response';
import { ListUsersResponseDTO } from './dto/list-users.response';
import { ListUsersQuery } from '@user/application/queries/list-users';

@ApiTags('User')
@Controller('user')
export class ListUsersController {
  constructor(readonly queryBus: QueryBus) {}

  @Version('1')
  @Get('list')
  @ApiOkResponse({
    description: ResponseDescription.OK,
    type: [ListUsersResponseDTO],
  })
  @ApiInternalServerErrorResponse({
    description: ResponseDescription.INTERNAL_SERVER_ERROR,
    type: GeneralResponse,
  })
  async listUsers() {
    const query = new ListUsersQuery();
    return this.queryBus.execute(query);
  }
}
