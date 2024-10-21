import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
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
    async handleMessage(
        @MessageBody() message: MessageType,
        @ConnectedSocket() client: Socket
    ): Promise<void> {
        await this.websocketService.handleMessage(message, this.server, client);
    }
}
