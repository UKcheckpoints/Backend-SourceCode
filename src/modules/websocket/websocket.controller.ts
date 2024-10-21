import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MessageType } from 'src/types/websocket.types';
import { WebsocketService } from './websocket.service';

@WebSocketGateway({
    path: '/ws',
    cors: { origin: '*' },
})
export class WebsocketController {
    @WebSocketServer() server: Server;

    constructor(private websocketService: WebsocketService) { }

    @SubscribeMessage('message')
    handleMessage(@MessageBody() message: MessageType): void {
        this.websocketService.handleMessage(message);
    }
}