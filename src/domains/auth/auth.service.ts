import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserModel } from '../user/entities/user.entity';

import * as bcrypt from 'bcrypt';
import { ENV_HASH_ROUND } from '../common/const/env-keys.const';
import { userDto } from '../user/dtos/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 회원가입 인증 유저 Service
   * @param user: UserModel
   */
  async registerAuthUser(user: userDto) {
    // 비밀번호 hash
    const hashedPassword = await bcrypt.hash(user.password, Number(this.configService.get<string>(ENV_HASH_ROUND)));
    console.log('hashedPwd ->', hashedPassword);
    const newUser = await this.userService.createUser({
      ...user,
      password: hashedPassword,
    });
  }
}
