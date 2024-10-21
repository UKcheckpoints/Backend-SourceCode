import { Injectable } from '@nestjs/common';
import { MessageType } from 'src/types/websocket.types';

@Injectable()
export class WebsocketService {
    handleMessage(message: MessageType): void {
        switch (message.type) {
            case 'auth':
                this.handleAuth(message);
                break;
            case 'checkpointUpdate':
                this.handleCheckpointUpdate(message);
                break;
            case 'pushNotification':
                this.handlePushNotification(message);
                break;
            case 'routePlanUpdate':
                this.handleRoutePlanUpdate(message);
                break;
            case 'trafficUpdate':
                this.handleTrafficUpdate(message);
                break;
            default:
                console.error('Unknown message type');
        }
    }

    private handleAuth(message: MessageType & { type: 'auth' }): void {
        console.log(`Authenticating user: ${message.email}`);
    }

    private handleCheckpointUpdate(message: MessageType & { type: 'checkpointUpdate' }): void {
        console.log(`Checkpoint update for ID ${message.id}: ${message.status}`);
    }

    private handlePushNotification(message: MessageType & { type: 'pushNotification' }): void {
        console.log(`Push notification for user ${message.userId}: ${message.content}`);
    }

    private handleRoutePlanUpdate(message: MessageType & { type: 'routePlanUpdate' }): void {
        console.log(`Route plan update for vehicle ${message.vehicleId}`);
    }

    private handleTrafficUpdate(message: MessageType & { type: 'trafficUpdate' }): void {
        console.log(`Traffic update for route ${message.affectedRoute}: ${message.status}`);
    }
}