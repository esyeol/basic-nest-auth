import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { userDto } from '../user/dtos/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async registerUser(@Body() user: userDto) {
    return await this.authService.registerAuthUser(user);
  }
}
