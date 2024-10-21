import { Module } from '@nestjs/common';
import { WebsocketService } from './websocket.service';
import { WebsocketController } from './websocket.controller';

@Module({
    providers: [WebsocketService, WebsocketController],
    controllers: []
})
export class WebsocketModule { }