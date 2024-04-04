import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AddUserRequestDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty({ description: 'user first name' })
  user_name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty({ description: 'user last name' })
  user_lastname: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @IsEmail()
  @ApiProperty({ description: 'user email' })
  user_email: string;
}
