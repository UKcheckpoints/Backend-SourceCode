import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommanModule } from './comman/comman.module';
import { PrismaModule } from './comman/database/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './helpers/logger/logger.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }),
  JwtModule.register({
    secret: process.env.JWT_SECRET || 'secretKey',
    signOptions: { expiresIn: '7d' },
  }),
    LoggerModule,
    PrismaModule,
    CommanModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
