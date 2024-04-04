import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ListUsersResponseDTO {
  @IsString()
  @ApiProperty()
  user_code: number;

  @IsString()
  @ApiProperty()
  user_name: string;

  @IsString()
  @ApiProperty()
  user_lastname: string;

  @IsString()
  @ApiProperty()
  user_email: string;

  constructor(code: number, name: string, lastname: string, email: string) {
    this.user_code = code;
    this.user_name = name;
    this.user_lastname = lastname;
    this.user_email = email;
  }
}
