import { Payload } from './../user/security/payload-interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ENV_HASH_ROUND, ENV_JWT_EXPOSE_ACCESS, ENV_JWT_EXPOSE_REFRESH } from '../common/const/env-keys.const';
import { userDto } from '../user/dtos/user.dto';
import { UserModel } from '../user/entities/user.entity';
import { TokenType } from '../common/const/token-type.const';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * SignToken
   * access & refresh Token Sign 로직
   * @param user: UserModel to PayLoad
   * @param isRefreshToken: access: false & refresh: true
   */
  signToken(user: Pick<UserModel, 'idx' | 'username' | 'affiliation' | 'role'>, isRefreshToken: boolean) {
    // Define JWT Payload
    const payLoad: Payload = {
      userIdx: user.idx,
      userName: user.username,
      affiliation: user.affiliation,
      role: user.role,
      type: isRefreshToken ? TokenType.REFRESH : TokenType.ACCESS,
    };

    /** Refresh는 PayLoad의 userIdx 값만 payload로 저장 access는 payload를 저장  */
    return this.jwtService.sign(isRefreshToken ? { userIdx: payLoad.userIdx, type: TokenType.REFRESH } : payLoad, {
      expiresIn: isRefreshToken
        ? this.configService.get<string>(ENV_JWT_EXPOSE_REFRESH)
        : this.configService.get<string>(ENV_JWT_EXPOSE_ACCESS),
    });
  }

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
    console.log('newUser ->', newUser);
  }

  /**
   * 로그인시 Id & Password 기반 검증로직
   */
  async authenticateWithIdAndPassword(user: Pick<userDto, 'userId' | 'password'>): Promise<UserModel> {
    const existingUser = await this.userService.getUserById(user.userId);

    // 반환되는 값이 null 경우 핸들링
    if (!existingUser) {
      throw new UnauthorizedException('Not Found User');
    }

    // bcrypt 기반 검증
    const passOk: boolean = await bcrypt.compare(user.password, existingUser.password);

    if (!passOk) {
      throw new UnauthorizedException('Not Colleted Passwrod');
    }

    return existingUser;
  }

  /**
   * 조건에 일치하는 유저 정보를 받았을 경우, Token 발급하는 메서드
   * @param user: UserModel
   */
  loginUser(user: UserModel) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  /**
   * 로그인 인증 Service
   */
  async validateUser(authUser: Pick<userDto, 'userId' | 'password'>) {
    // id, pwd 기반 검증 확인
    const existingUser: UserModel = await this.authenticateWithIdAndPassword(authUser);
    return this.loginUser(existingUser);
  }
}
