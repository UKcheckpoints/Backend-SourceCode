import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommanModule } from './comman/comman.module';
import { PrismaModule } from './comman/database/prisma/prisma.module';

@Module({
  imports: [PrismaModule, CommanModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
