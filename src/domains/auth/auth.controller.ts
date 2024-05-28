import { Body, Controller, Post, Res, UseGuards, Headers, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { userDto } from '../user/dtos/user.dto';
import { Response } from 'express';
import { RefreshTokenGuard } from './guard/bearer-token.guard';
import { UserService } from '../user/user.service';
import { UserModel } from '../user/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  /** 코디용 회원가입 -> 임시 */
  @Post('/register')
  async registerUser(@Body() user: userDto) {
    return await this.authService.registerAuthUser(user);
  }

  /** 코디용 로그인*/
  @Post('/login')
  async login(@Body() user: Pick<userDto, 'userId' | 'password'>, @Res() res: Response) {
    // access, refresh token이 포함되어 있는 리턴값
    const token = await this.authService.validateUser(user);

    res.setHeader('authorization', 'Bearer' + [token.accessToken]);
    res.cookie('accessToken', token.accessToken, {
      httpOnly: true,
    });

    res.cookie('refreshToken', token.refreshToken, {
      httpOnly: true,
    });

    res.json({
      message: 'success',
      // accessToken: token.accessToken,
      // refreshToken: token.refreshToken,
    });
  }

  /** AccessToken 재발급 -> Refresh Token 기반 검증*/
  @Post('token/access')
  @UseGuards(RefreshTokenGuard)
  async postTokenRefresh(@Headers('authorization') rawToken: string, @Res() res: Response) {
    // refresh Token 조회
    const token = this.authService.extractTokenFromHeader(rawToken);

    const newAccessToken = await this.authService.rotateAccessToken(token);
    console.log('newAccessToken ->', newAccessToken);
    // return newAccessToken;
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
    });

    res.json({ message: 'success' });
  }

  /**logout*/
  @Post('/logout')
  @UseGuards(RefreshTokenGuard)
  async logout(@Headers('authorization') rawToken: string, @Res() res: Response) {
    // refreshToken 추출
    const token = this.authService.extractTokenFromHeader(rawToken);
    // payLoad 추출
    const verifyPayLoad = this.authService.verifyToken(token);

    await this.userService.removeRefreshToken(verifyPayLoad.userIdx);
    // await this.userService.removeRefreshToken(req.user.userIdx);

    // 쿠키 제거
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.json({ message: 'success logout' });
  }

  /** 서로다른 브라우저에서 로그인 했을 때, Refresh Token 검증을 위한 end-point */
  @Post('/refresh-token/verify')
  @UseGuards(RefreshTokenGuard)
  async isVerifyRefreshToken(@Headers('authorization') rawToken: string, @Res() res: Response) {
    // refresh Token 추출
    const refreshToken = this.authService.extractTokenFromHeader(rawToken);
    // payLoad 추출
    const verifyPayLoad = this.authService.verifyToken(refreshToken);
    // 유저 정보 추출
    const user: UserModel = await this.userService.getUserByIdx(verifyPayLoad.userIdx);
    // refresh 토큰 검증
    const isVerifyUserWithRefreshToken: boolean = await this.userService.isRefreshTokenMatch(
      refreshToken,
      user.refreshToken,
    );

    if (isVerifyUserWithRefreshToken) {
      return res.status(200).json({ message: 'ok' });
    } else {
      throw new UnauthorizedException('notValidateUser');
    }
  }
}
