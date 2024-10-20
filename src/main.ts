import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import { RequestLoggingInterceptor } from './utils/globalReqLogger';
import * as cookieParser from 'cookie-parser';
import { BigIntSerializerMiddleware } from './middleware/bigint-serializer.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const environment = process.env.NODE?.toLowerCase();
  if (environment !== 'production' && environment !== 'prod') {
    app.useGlobalInterceptors(new RequestLoggingInterceptor());
  }

  app.use(new BigIntSerializerMiddleware().use);

  app.use(cors({
    origin: process.env.ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }));

  app.use(cookieParser())
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
}

bootstrap().catch(err => {
  console.error('Error starting the application:', err);
  process.exit(1);
});
