import { TokenType } from './../../common/const/token-type.const';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserService } from 'src/domains/user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class BearerTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const bearerToken = await req.headers['authorization'];

    // 토큰이 존재하지 않을 경우 401에러 반환
    if (!bearerToken) {
      throw new UnauthorizedException('Not Found Token');
    }

    // token 값을 추출
    const token: string = this.authService.extractTokenFromHeader(bearerToken);

    // token 검증 및 정보 추출
    const result = await this.authService.verifyToken(token);

    const user = await this.userService.getUserByIdx(result.userIdx);

    req.token = token; // 토큰 값 반환 access or refresh
    req.tokenType = result.type; // 토큰 유형 반환 'access' | 'refresh'
    req.user = user; // user info 반환

    return true;
  }
}

/**Access Token Guard*/
@Injectable()
export class AccessTokenGuard extends BearerTokenGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const req = context.switchToHttp().getRequest();

    if (req.tokenType !== TokenType.ACCESS) {
      throw new UnauthorizedException('Not Invalid Access Token');
    }

    return true;
  }
}

/**Refresh Token Guard*/
@Injectable()
export class RefreshTokenGuard extends BearerTokenGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // BearerToken Guard의 절차를 모두 상속받아서 처리
    await super.canActivate(context);

    const req = context.switchToHttp().getRequest();

    if (req.tokenType !== TokenType.REFRESH) {
      throw new UnauthorizedException('Not Invalid Refresh Token');
    }
    // return true;
    return req;
  }
}
