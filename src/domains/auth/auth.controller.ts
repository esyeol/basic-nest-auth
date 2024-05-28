import { Body, Controller, Post, Res, UseGuards, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { userDto } from '../user/dtos/user.dto';
import { Response } from 'express';
import { RefreshTokenGuard } from './guard/bearer-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    });
  }

  /**
   * AccessToken 재발급 -> Refresh Token 기반 검증
   */
  @Post('token/access')
  @UseGuards(RefreshTokenGuard)
  async postTokenRefresh(@Headers('authorization') rawToken: string) {
    // refresh Token 조회
    const token = this.authService.extractTokenFromHeader(rawToken);
    console.log('token', token);
    const newAccessToken = this.authService.rotateAccessToken(token);
    return newAccessToken;
  }
}
