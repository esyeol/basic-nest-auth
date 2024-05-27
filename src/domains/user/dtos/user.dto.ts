import { IsEnum, IsPhoneNumber, IsString, Length } from 'class-validator';
import { UserRolesEnum } from '../const/user-role.enum';
/**
 * Create User Dto
 */
export class userDto {
  // userId
  @IsString()
  @Length(2)
  userId: string;

  // password
  @IsString()
  @Length(8)
  password: string;

  // username
  @IsString()
  @Length(2, 20)
  username: string;

  // userPhone
  @IsString()
  @IsPhoneNumber('KR')
  userPhone: string;

  // affiliation
  @IsString()
  @Length(3, 25)
  affiliation: string;

  // role
  @IsEnum(UserRolesEnum, { message: 'Not Collect Enum Value' })
  role: UserRolesEnum;
}
