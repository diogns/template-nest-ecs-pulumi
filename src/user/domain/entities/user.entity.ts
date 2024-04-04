export class UserEntity {
  userCode: number;
  userName: string;
  userLastName: string;
  userEmail: string;

  constructor(
    userCode: number,
    userName: string,
    userLastName: string,
    userEmail: string,
  ) {
    this.userCode = userCode;
    this.userName = userName;
    this.userLastName = userLastName;
    this.userEmail = userEmail;
  }
}
