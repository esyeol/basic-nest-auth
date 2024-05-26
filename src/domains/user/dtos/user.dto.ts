import { UserRolesEnum } from '../const/user-role.enum';
/**
 * Create User Dto
 */
export class userDto {
  // userId
  userId: string;
  // password
  password: string;
  // username
  username: string;
  // userPhone
  userPhone: string;
  // affiliation
  affiliation: string;
  // role
  role: UserRolesEnum;
}
