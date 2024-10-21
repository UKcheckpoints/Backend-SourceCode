import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommanModule } from './comman/comman.module';
import { PrismaModule } from './comman/database/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './helpers/logger/logger.module';
import { MapModule } from './modules/map/map.module';
import { AdminModule } from './modules/admin/admin.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { WebsocketModule } from './modules/websocket/websocket.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }),
    LoggerModule,
    PrismaModule,
    CommanModule,
    AuthModule,
    MapModule,
    AdminModule,
    StripeModule,
    WebsocketModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
