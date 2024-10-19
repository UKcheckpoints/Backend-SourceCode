import { Test, TestingModule } from '@nestjs/testing';
import { CheckpointStatus } from '@prisma/client';
import { CheckpointPassRepository } from '../checkpoint-pass.repository';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CheckpointPassEntity } from '../../entities/checkpoint-pass.entity';

describe('CheckpointPassRepository', () => {
    let repository: CheckpointPassRepository;
    let prismaService: PrismaService;

    const mockPrismaService = {
        checkpointPass: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
        },
    };

    const checkpointPassEntity: CheckpointPassEntity = {
        id: BigInt(1),
        userId: BigInt(2),
        checkpointId: BigInt(3),
        passedAt: new Date(),
        status: CheckpointStatus.ACTIVE,
        comment: 'Test comment',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CheckpointPassRepository,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        repository = module.get<CheckpointPassRepository>(CheckpointPassRepository);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('createCheckpointPass', () => {
        it('should create and return a new checkpoint pass', async () => {
            mockPrismaService.checkpointPass.create.mockResolvedValue(checkpointPassEntity);

            const data = { userId: BigInt(2), checkpointId: BigInt(3), status: CheckpointStatus.ACTIVE, comment: 'Test comment' };
            const result = await repository.createCheckpointPass(data);

            expect(prismaService.checkpointPass.create).toHaveBeenCalledWith({
                data: { ...data },
            });
            expect(result).toEqual(new CheckpointPassEntity(checkpointPassEntity));
        });
    });

    describe('findCheckpointPassById', () => {
        it('should return a checkpoint pass if found', async () => {
            mockPrismaService.checkpointPass.findUnique.mockResolvedValue(checkpointPassEntity);

            const result = await repository.findCheckpointPassById(BigInt(1));

            expect(prismaService.checkpointPass.findUnique).toHaveBeenCalledWith({
                where: { id: BigInt(1) },
            });
            expect(result).toEqual(new CheckpointPassEntity(checkpointPassEntity));
        });

        it('should return null if checkpoint pass not found', async () => {
            mockPrismaService.checkpointPass.findUnique.mockResolvedValue(null);

            const result = await repository.findCheckpointPassById(BigInt(1));

            expect(result).toBeNull();
        });
    });

    describe('updateCheckpointPass', () => {
        it('should update and return the updated checkpoint pass', async () => {
            const updatedEntity = { ...checkpointPassEntity, comment: 'Updated comment' };
            mockPrismaService.checkpointPass.update.mockResolvedValue(updatedEntity);

            const result = await repository.updateCheckpointPass(BigInt(1), { comment: 'Updated comment' });

            expect(prismaService.checkpointPass.update).toHaveBeenCalledWith({
                where: { id: BigInt(1) },
                data: { comment: 'Updated comment' },
            });
            expect(result).toEqual(new CheckpointPassEntity(updatedEntity));
        });
    });

    describe('deleteCheckpointPass', () => {
        it('should delete and return the deleted checkpoint pass', async () => {
            mockPrismaService.checkpointPass.delete.mockResolvedValue(checkpointPassEntity);

            const result = await repository.deleteCheckpointPass(BigInt(1));

            expect(prismaService.checkpointPass.delete).toHaveBeenCalledWith({
                where: { id: BigInt(1) },
            });
            expect(result).toEqual(new CheckpointPassEntity(checkpointPassEntity));
        });
    });

    describe('findAllCheckpointPasses', () => {
        it('should return an array of checkpoint passes', async () => {
            mockPrismaService.checkpointPass.findMany.mockResolvedValue([checkpointPassEntity]);

            const result = await repository.findAllCheckpointPasses();

            expect(prismaService.checkpointPass.findMany).toHaveBeenCalled();
            expect(result).toEqual([new CheckpointPassEntity(checkpointPassEntity)]);
        });
    });
});
