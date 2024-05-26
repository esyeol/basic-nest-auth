import { BaseModel } from 'src/domains/common/entities/base.entity';
import { Column, DeleteDateColumn, Entity } from 'typeorm';
import { UserRolesEnum } from '../const/user-role.enum';
import { IsEnum, IsPhoneNumber, IsString, Length } from 'class-validator';

/**
 * User 정보를 저장하는 테이블을 정의
 */
@Entity('user')
export class UserModel extends BaseModel {
  @IsString()
  @Length(2)
  @Column({
    length: 20,
    nullable: false,
    unique: true,
    type: 'varchar',
    name: 'user_id',
  })
  userId: string;

  @IsString()
  @Length(8)
  @Column({
    length: 255,
    nullable: false,
    type: 'varchar',
    name: 'user_password',
  })
  userPassword: string;

  @IsString()
  @Length(2, 20)
  @Column({
    length: 15,
    nullable: false,
    type: 'varchar',
    name: 'username',
  })
  username: string;

  @IsString()
  @IsPhoneNumber('KR')
  @Column({
    length: 20,
    nullable: false,
    comment: '유저의 핸드폰번호',
    type: 'varchar',
    name: 'user_phone',
  })
  userPhone: string;

  @IsString()
  @Length(3, 25)
  @Column({
    length: 25,
    nullable: false,
    type: 'varchar',
    name: 'affiliation',
  })
  affiliation: string;

  @IsEnum(UserRolesEnum, { message: 'Not Collect Enum Value' })
  @Column({
    type: 'enum',
    nullable: false,
    enum: Object.values(UserRolesEnum),
    name: 'role',
  })
  role: UserRolesEnum;

  @Column({
    type: 'boolean',
    name: 'privacy_aggrement',
    comment: '개인정보처리방침동의여부 0 -> false, 1 -> true',
  })
  privacyAggrement: boolean;

  @DeleteDateColumn({
    type: 'timestamp',
    name: 'deleted_at',
  })
  deletedAt: Date;
}
