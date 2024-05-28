import { TokenType } from 'src/domains/common/const/token-type.const';
import { UserRolesEnum } from '../const/user-role.enum';

/**
 * Define JWT Payload
 */
export interface Payload {
  userIdx: number;
  userName: string;
  affiliation: string;
  role: UserRolesEnum; // codi, parent, instructor, master
  type: TokenType; // access, refresh
}
