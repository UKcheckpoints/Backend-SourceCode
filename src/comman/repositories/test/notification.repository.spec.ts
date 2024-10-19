import { Test, TestingModule } from '@nestjs/testing';
import { NotificationRepository } from '../notification.repository';
import { PrismaService } from '../../database/prisma/prisma.service';
import { NotificationEntity } from '../../entities/notification.entity';

describe('NotificationRepository', () => {
    let repository: NotificationRepository;
    let prismaService: PrismaService;

    const mockPrismaService = {
        notification: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
        },
    };

    const notificationEntity: NotificationEntity = {
        id: BigInt(1),
        userId: BigInt(2),
        title: 'Test Notification',
        message: 'This is a test notification message.',
        createdAt: new Date(),
        sentById: BigInt(3),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationRepository,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        repository = module.get<NotificationRepository>(NotificationRepository);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('createNotification', () => {
        it('should create and return a new notification', async () => {
            mockPrismaService.notification.create.mockResolvedValue(notificationEntity);

            const data = {
                userId: BigInt(2),
                title: 'Test Notification',
                message: 'This is a test notification message.',
                sentById: BigInt(3),
            };

            const result = await repository.createNotification(data);

            expect(prismaService.notification.create).toHaveBeenCalledWith({ data });
            expect(result).toEqual(new NotificationEntity(notificationEntity));
        });
    });

    describe('findNotificationById', () => {
        it('should return a notification if found', async () => {
            mockPrismaService.notification.findUnique.mockResolvedValue(notificationEntity);

            const result = await repository.findNotificationById(BigInt(1));

            expect(prismaService.notification.findUnique).toHaveBeenCalledWith({
                where: { id: BigInt(1) },
            });
            expect(result).toEqual(new NotificationEntity(notificationEntity));
        });

        it('should return null if no notification is found', async () => {
            mockPrismaService.notification.findUnique.mockResolvedValue(null);

            const result = await repository.findNotificationById(BigInt(1));

            expect(result).toBeNull();
        });
    });

    describe('updateNotification', () => {
        it('should update and return the updated notification', async () => {
            const updatedEntity = { ...notificationEntity, message: 'Updated message' };
            mockPrismaService.notification.update.mockResolvedValue(updatedEntity);

            const result = await repository.updateNotification(BigInt(1), { message: 'Updated message' });

            expect(prismaService.notification.update).toHaveBeenCalledWith({
                where: { id: BigInt(1) },
                data: { message: 'Updated message' },
            });
            expect(result).toEqual(new NotificationEntity(updatedEntity));
        });
    });

    describe('deleteNotification', () => {
        it('should delete and return the deleted notification', async () => {
            mockPrismaService.notification.delete.mockResolvedValue(notificationEntity);

            const result = await repository.deleteNotification(BigInt(1));

            expect(prismaService.notification.delete).toHaveBeenCalledWith({
                where: { id: BigInt(1) },
            });
            expect(result).toEqual(new NotificationEntity(notificationEntity));
        });
    });

    describe('findAllNotifications', () => {
        it('should return an array of notifications', async () => {
            mockPrismaService.notification.findMany.mockResolvedValue([notificationEntity]);

            const result = await repository.findAllNotifications();

            expect(prismaService.notification.findMany).toHaveBeenCalled();
            expect(result).toEqual([new NotificationEntity(notificationEntity)]);
        });

        it('should return an empty array if no notifications are found', async () => {
            mockPrismaService.notification.findMany.mockResolvedValue([]);

            const result = await repository.findAllNotifications();

            expect(result).toEqual([]);
        });
    });
});
