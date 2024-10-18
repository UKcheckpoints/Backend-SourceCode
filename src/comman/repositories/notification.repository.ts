import { Injectable } from '@nestjs/common';
import { NotificationEntity } from '../entities/notification.entity';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class NotificationRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createNotification(data: Omit<NotificationEntity, 'id' | 'createdAt'>): Promise<NotificationEntity> {
        const notification = await this.prisma.notification.create({
            data: {
                ...data,
            },
        });
        return new NotificationEntity(notification);
    }

    async findNotificationById(id: bigint): Promise<NotificationEntity | null> {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
        });
        return notification ? new NotificationEntity(notification) : null;
    }

    async updateNotification(id: bigint, data: Partial<NotificationEntity>): Promise<NotificationEntity> {
        const notification = await this.prisma.notification.update({
            where: { id },
            data,
        });
        return new NotificationEntity(notification);
    }

    async deleteNotification(id: bigint): Promise<NotificationEntity> {
        const notification = await this.prisma.notification.delete({
            where: { id },
        });
        return new NotificationEntity(notification);
    }

    async findAllNotifications(): Promise<NotificationEntity[]> {
        const notifications = await this.prisma.notification.findMany();
        return notifications.map(notification => new NotificationEntity(notification));
    }
}
