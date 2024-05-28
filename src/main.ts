declare const module: any;

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as helmet from 'helmet';
import * as hpp from 'hpp';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(hpp());

  app.use(helmet.hidePoweredBy());
  app.use(helmet.xssFilter());
  app.use(helmet.frameguard());

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
