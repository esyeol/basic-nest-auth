import { IsEnum, IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';
import { UserRolesEnum } from '../const/user-role.enum';
/**
 * Create User Dto
 */
export class userDto {
  // userId
  @IsNotEmpty()
  @IsString()
  @Length(2)
  userId: string;

  // password
  @IsNotEmpty()
  @IsString()
  @Length(8)
  password: string;

  // username
  @IsNotEmpty()
  @IsString()
  @Length(2, 20)
  username: string;

  // userPhone
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('KR')
  userPhone: string;

  // affiliation
  @IsNotEmpty()
  @IsString()
  @Length(3, 25)
  affiliation: string;

  // role
  @IsNotEmpty()
  @IsEnum(UserRolesEnum, { message: 'Not Collect Enum Value' })
  role: UserRolesEnum;
}
