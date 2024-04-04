import { ApiProperty } from '@nestjs/swagger';

export class GeneralResponse {
  @ApiProperty({ description: 'http status code' })
  readonly statusCode: number;
  @ApiProperty({ description: 'error message / validation message' })
  readonly message: string;
  @ApiProperty({ description: 'http status code description' })
  readonly error: string;
}
