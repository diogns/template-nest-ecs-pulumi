import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateUserEmailRequestDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @IsEmail()
  @ApiProperty({ description: 'user email' })
  user_email: string;
}
