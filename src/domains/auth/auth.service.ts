import { Payload } from './../user/security/payload-interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  ENV_HASH_ROUND,
  ENV_JWT_EXPOSE_ACCESS,
  ENV_JWT_EXPOSE_REFRESH,
  ENV_JWT_SECRETE,
} from '../common/const/env-keys.const';
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
    // return this.loginUser(existingUser);
    const token = this.loginUser(existingUser);

    // Refresh token 저장
    await this.userService.setCurrentRefreshToken(token.refreshToken, existingUser.idx);
    return token;
  }

  /**
   * Header로 부터 받아온 토큰값을 검증하고 추출하는 메서드
   * @param header: header value
   * Header의 토큰은 다음과 같이 들어옴 Bearer {Access} or Bearer {Refresh}
   */
  extractTokenFromHeader(header: string) {
    // 띄어쓰기로 2배열로 분리 -> Bearer, Token
    const splitToken = header.split(' ');
    console.log('split Token ->', splitToken);
    // splitToken으로 구분한 Token의 크기가 2가 아니거나 Bearer이 아닐경우 핸들링
    if (splitToken.length !== 2 || splitToken[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid Token');
    }

    // token을 추출
    const token: string = splitToken[1];
    return token;
  }

  /**
   * 토큰 검증 및 토큰 정보를 반환
   * @param token: Access & Refresh
   */
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>(ENV_JWT_SECRETE),
      });
    } catch (error) {
      throw new UnauthorizedException('토큰이 만료되었거나 잘못된 토큰 입니다.');
    }
  }

  /**
   * 새로운 access 토큰 발급
   */
  async rotateAccessToken(token: string) {
    // token 정보를 추출
    const decoded = this.jwtService.verify(token, {
      secret: this.configService.get<string>(ENV_JWT_SECRETE),
    });
    console.log('decoded ->', decoded);
    // 위에서 디코딩한 토큰이 refresh가 아닐경우 에러 핸들링
    if (decoded.type !== TokenType.REFRESH) {
      throw new UnauthorizedException('Failed To Access Rotate Token');
    }

    // Access Token을 재발급 하기 위한 userInfo 추출
    const userInfo: UserModel = await this.userService.getUserInfoWithRefreshAndUserIdx(token, decoded.userIdx);

    // 유저의 정보가 없거나 refresh가 없을 때 401 핸들링
    if (userInfo === null) {
      throw new UnauthorizedException('Not Found Your Info OR RefreshToken');
    }

    // access Token 재발급을 하기위하기 때문에 signToken의 parameter를 false로 지정
    return this.signToken(
      {
        ...userInfo,
      },
      false,
    );
  }
}
