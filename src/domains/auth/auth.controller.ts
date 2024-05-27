import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { userDto } from '../user/dtos/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** 코디용 회원가입 */
  @Post('/register')
  async registerUser(@Body() user: userDto) {
    return await this.authService.registerAuthUser(user);
  }

  /** 코디용 로그인*/
  @Post('/login')
  async login(@Body() user: Pick<userDto, 'userId' | 'password'>) {
    return this.authService.validateUser(user);
  }
}
