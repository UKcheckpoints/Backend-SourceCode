import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { UserRepository } from 'src/comman/repositories/user.repository';
import { LoggerService } from 'src/helpers/logger/logger.service';
import { CheckpointUpdateNode, MessageType, NodeAuthMessage } from 'src/types/websocket.types';
import { decryptBase64Email } from 'src/utils/decryptBaseEmail';
import { CheckpointPOIRepository } from 'src/comman/repositories/checkpoint-poi.repository';

@Injectable()
export class WebsocketService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly logger: LoggerService,
        private readonly checkpointPOIRepository: CheckpointPOIRepository
    ) { }

    async handleMessage(message: MessageType, server: Server, client: Socket): Promise<void> {
        switch (message.type) {
            case 'auth':
                const isAuthenticated = await this.handleAuth(message, client);
                if (!isAuthenticated) {
                    client.disconnect(true);
                }
                break;
            case 'checkpointUpdate':
                await this.handleCheckpointUpdate(message, server);
                break;
            case 'pushNotification':
                await this.handlePushNotification(message);
                break;
            case 'routePlanUpdate':
                await this.handleRoutePlanUpdate(message);
                break;
            case 'trafficUpdate':
                await this.handleTrafficUpdate(message);
                break;
            default:
                this.logger.error('Unknown message type');
        }
    }

    async handleAuth({ email }: NodeAuthMessage, client: Socket): Promise<boolean> {
        try {
            const decryptedEmail = decryptBase64Email(email);

            const user = await this.userRepository.findUserByUsername(decryptedEmail);

            if (user) {
                this.logger.info(`User authenticated: ${decryptedEmail}`);
                return true;
            } else {
                this.logger.error(`Authentication failed: No user found with email ${decryptedEmail}`);
                return false;
            }
        } catch (error) {
            this.logger.error('Error during authentication:', error);
            return false;
        }
    }

    async handleCheckpointUpdate({ status, id, comment }: CheckpointUpdateNode, server: Server): Promise<void> {
        try {
            const checkpointId = BigInt(id);
            const updatedCheckpoint = await this.checkpointPOIRepository.updateCheckpointPOI(checkpointId, {
                status,
                comment
            });

            this.logger.info(`Checkpoint updated: ID ${id}, Status: ${status}, Comment: ${comment}`);

            server.emit('checkpointUpdated', {
                id: updatedCheckpoint.id.toString(),
                status: updatedCheckpoint.status,
                comment: updatedCheckpoint.comment,
                lastUpdated: updatedCheckpoint.lastUpdated
            });
        } catch (error) {
            this.logger.error(`Error updating checkpoint: ${error.message}`);
        }
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
