import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './entities/user.entity';
import { Repository } from 'typeorm';
import { userDto } from './dtos/user.dto';

import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { ENV_HASH_ROUND, ENV_JWT_EXPOSE_REFRESH } from '../common/const/env-keys.const';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Signup User Service
   * @param user: UserModel
   */
  async createUser(user: userDto) {
    const existUserId = await this.userRepository.exists({
      where: {
        userId: user.userId,
      },
    });

    // ID 중복여부 체크
    if (existUserId) {
      throw new BadRequestException('이미 존재하는 유저입니다.');
    }

    const createNewUser = this.userRepository.create(user);
    const saveUser = this.userRepository.save(createNewUser);

    return saveUser;
  }

  /**
   * User Id 조회
   */
  async getUserById(userId: string) {
    return this.userRepository.findOne({
      where: {
        userId,
      },
    });
  }

  /**
   * Update Refresh Token for Login
   * @param refreshToken: refreshToken
   * @param userIdx: userIdx Key
   */
  async setCurrentRefreshToken(refreshToken: string, userIdx: number) {
    // Refresh Token을 Hashing
    const hashedRefreshToken: string = await this.setHashedRefreshToken(refreshToken);
    // Refresh Token의 EXP 시간을 datetime으로 변경
    const currentRefreshTokenExp: Date = await this.getCurrentRefreshTokenExp();
    // Refresh Token의 정보를 업데이트
    await this.userRepository.update(userIdx, {
      refreshToken: hashedRefreshToken,
      refreshTokenExp: currentRefreshTokenExp,
    });
  }

  /**
   * Hashed with Refresh Token
   * @param refreshToken: RefreshToken
   */
  async setHashedRefreshToken(refreshToken: string): Promise<string> {
    const currentRefreshToken: string = await bcrypt.hash(
      refreshToken,
      Number(this.configService.get<string>(ENV_HASH_ROUND)),
    );
    return currentRefreshToken;
  }

  /**
   * get Refresh Token Expired Time
   */
  async getCurrentRefreshTokenExp(): Promise<Date> {
    const currentDate = new Date();
    const currentRefreshTokenExp = new Date(
      currentDate.getTime() + parseInt(this.configService.get<string>(ENV_JWT_EXPOSE_REFRESH)),
    );
    return currentRefreshTokenExp;
  }
}
