import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommanModule } from './comman/comman.module';
import { PrismaModule } from './comman/database/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './helpers/logger/logger.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
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
