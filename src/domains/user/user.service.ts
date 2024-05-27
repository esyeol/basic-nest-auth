import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './entities/user.entity';
import { Repository } from 'typeorm';
import { userDto } from './dtos/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
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
}
