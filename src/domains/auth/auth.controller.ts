import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { userDto } from '../user/dtos/user.dto';
import { Response } from 'express';

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
   * Refresh Token을 사용한 AccessToken 재발급
   */
}
