import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor() {
    super(UserNotFoundException.getMessage());
  }
  static getMessage() {
    return 'User was not found in database';
  }
}
