import { Module } from '@nestjs/common';
import { WebsocketService } from './websocket.service';
import { WebsocketController } from './websocket.controller';
import { UserRepository } from 'src/comman/repositories/user.repository';
import { PrismaService } from 'src/comman/database/prisma/prisma.service';
import { LoggerService } from 'src/helpers/logger/logger.service';
import { CheckpointPOIRepository } from 'src/comman/repositories/checkpoint-poi.repository';

@Module({
    providers: [WebsocketService, WebsocketController, PrismaService, UserRepository, LoggerService, CheckpointPOIRepository],
    controllers: []
})
export class WebsocketModule { }