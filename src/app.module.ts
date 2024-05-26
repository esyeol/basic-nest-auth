import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './domains/common/common.module';
import { ThrottlerModule } from '@nestjs/throttler';

import {
  ENV_DB_DATABASE,
  ENV_DB_HOST,
  ENV_DB_PASSWORD,
  ENV_DB_PORT,
  ENV_DB_USER,
} from './domains/common/const/env-keys.const';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { AuthModule } from './domains/auth/auth.module';
import { UserModule } from './domains/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.development.env'], // 서비스 배포시 producet.env로 변경
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{ name: 'short', ttl: 1000, limit: 10 }]), // 초당 10번 이상의 요청 제외
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env[ENV_DB_HOST],
      port: parseInt(process.env[ENV_DB_PORT]),
      username: process.env[ENV_DB_USER],
      password: process.env[ENV_DB_PASSWORD],
      database: process.env[ENV_DB_DATABASE],
      entities: [],
      synchronize: true,
    }),
    CommonModule,
    AuthModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
