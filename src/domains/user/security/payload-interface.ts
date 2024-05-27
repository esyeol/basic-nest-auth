import { UserRolesEnum } from '../const/user-role.enum';

/**
 * Define JWT Payload
 */
export interface Payload {
  userIdx: string;
  userName: string;
  affiliation: string;
  role: UserRolesEnum;
}
