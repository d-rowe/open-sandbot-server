import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import ConfigProvider from './utils/ConfigProvider';

const DEV_PORT = 3000;
const PRODUCTION_PORT = 80;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = ConfigProvider.isProduction() ? PRODUCTION_PORT : DEV_PORT;
  await app.listen(port, '0.0.0.0');
}

bootstrap();
