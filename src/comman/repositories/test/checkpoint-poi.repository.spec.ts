import { Test, TestingModule } from '@nestjs/testing';
import { CheckpointPOIRepository } from '../checkpoint-poi.repository';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CheckpointStatus } from '@prisma/client';
import { CheckpointPOIEntity } from '../../entities/checkpoint-poi.entity';

describe('CheckpointPOIRepository', () => {
    let repository: CheckpointPOIRepository;
    let prismaService: PrismaService;

    const mockCheckpointPOIData = {
        id: BigInt(1),
        name: 'Test POI',
        status: CheckpointStatus.ACTIVE,
        latitude: 12.34567,
        longitude: 76.54321,
        lastUpdated: new Date(),
        statusUpdatedById: BigInt(1),
        comment: 'A test checkpoint',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CheckpointPOIRepository, PrismaService],
        }).compile();

        repository = module.get<CheckpointPOIRepository>(CheckpointPOIRepository);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    afterEach(async () => {
        await prismaService.checkpointPOI.deleteMany();
    });

    it('should create a new checkpoint POI', async () => {
        jest.spyOn(prismaService.checkpointPOI, 'create').mockResolvedValue(mockCheckpointPOIData as any);

        const result = await repository.createCheckpointPOI({
            name: mockCheckpointPOIData.name,
            status: mockCheckpointPOIData.status,
            latitude: mockCheckpointPOIData.latitude,
            longitude: mockCheckpointPOIData.longitude,
            statusUpdatedById: mockCheckpointPOIData.statusUpdatedById,
            comment: mockCheckpointPOIData.comment,
        });

        expect(result).toEqual(new CheckpointPOIEntity(mockCheckpointPOIData));
        expect(prismaService.checkpointPOI.create).toHaveBeenCalledWith({
            data: {
                name: mockCheckpointPOIData.name,
                status: mockCheckpointPOIData.status,
                latitude: mockCheckpointPOIData.latitude,
                longitude: mockCheckpointPOIData.longitude,
                statusUpdatedById: mockCheckpointPOIData.statusUpdatedById,
                comment: mockCheckpointPOIData.comment,
            },
        });
    });

    it('should find a checkpoint POI by ID', async () => {
        jest.spyOn(prismaService.checkpointPOI, 'findUnique').mockResolvedValue(mockCheckpointPOIData as any);

        const result = await repository.findCheckpointPOIById(mockCheckpointPOIData.id);

        expect(result).toEqual(new CheckpointPOIEntity(mockCheckpointPOIData));
        expect(prismaService.checkpointPOI.findUnique).toHaveBeenCalledWith({ where: { id: mockCheckpointPOIData.id } });
    });

    it('should return null if checkpoint POI is not found', async () => {
        jest.spyOn(prismaService.checkpointPOI, 'findUnique').mockResolvedValue(null);

        const result = await repository.findCheckpointPOIById(BigInt(999)); // Non-existing ID

        expect(result).toBeNull();
    });

    it('should update a checkpoint POI', async () => {
        const updatedData = { ...mockCheckpointPOIData, name: 'Updated Test POI' };
        jest.spyOn(prismaService.checkpointPOI, 'update').mockResolvedValue(updatedData as any);

        const result = await repository.updateCheckpointPOI(mockCheckpointPOIData.id, { name: 'Updated Test POI' });

        expect(result).toEqual(new CheckpointPOIEntity(updatedData));
        expect(prismaService.checkpointPOI.update).toHaveBeenCalledWith({
            where: { id: mockCheckpointPOIData.id },
            data: { name: 'Updated Test POI' },
        });
    });

    it('should delete a checkpoint POI', async () => {
        jest.spyOn(prismaService.checkpointPOI, 'delete').mockResolvedValue(mockCheckpointPOIData as any);

        const result = await repository.deleteCheckpointPOI(mockCheckpointPOIData.id);

        expect(result).toEqual(new CheckpointPOIEntity(mockCheckpointPOIData));
        expect(prismaService.checkpointPOI.delete).toHaveBeenCalledWith({ where: { id: mockCheckpointPOIData.id } });
    });

    it('should find all checkpoint POIs', async () => {
        const checkpointPOIs = [mockCheckpointPOIData];
        jest.spyOn(prismaService.checkpointPOI, 'findMany').mockResolvedValue(checkpointPOIs as any);

        const result = await repository.findAllCheckpointPOIs();

        expect(result).toEqual(checkpointPOIs.map(data => new CheckpointPOIEntity(data)));
        expect(prismaService.checkpointPOI.findMany).toHaveBeenCalled();
    });
});
