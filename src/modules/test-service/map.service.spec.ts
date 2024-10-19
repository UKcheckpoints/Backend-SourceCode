import { Test, TestingModule } from '@nestjs/testing';
import { MapService } from '../map/map.service';
import { CheckpointPOIRepository } from '../../comman/repositories/checkpoint-poi.repository';
import { UserRepository } from '../../comman/repositories/user.repository';
import { CheckpointStatus } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { CheckpointPOIEntity } from '../../comman/entities/checkpoint-poi.entity';

describe('MapService', () => {
    let service: MapService;
    let poiRepoMock: jest.Mocked<CheckpointPOIRepository>;
    let userRepoMock: jest.Mocked<UserRepository>;

    beforeEach(async () => {
        poiRepoMock = {
            findAllCheckpointPOIs: jest.fn(),
            findCheckpointPOIById: jest.fn(),
            updateCheckpointPOI: jest.fn(),
            createCheckpointPOI: jest.fn(),
            deleteCheckpointPOI: jest.fn(),
        } as any;

        userRepoMock = {
            findUserByUsername: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MapService,
                { provide: CheckpointPOIRepository, useValue: poiRepoMock },
                { provide: UserRepository, useValue: userRepoMock },
            ],
        }).compile();

        service = module.get<MapService>(MapService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAllPOIs', () => {
        it('should return all POIs', async () => {
            const mockPOIs = [{ id: BigInt(1), name: 'POI 1' }, { id: BigInt(2), name: 'POI 2' }] as CheckpointPOIEntity[];
            poiRepoMock.findAllCheckpointPOIs.mockResolvedValue(mockPOIs);

            const result = await service.getAllPOIs();
            expect(result).toEqual(mockPOIs);
            expect(poiRepoMock.findAllCheckpointPOIs).toHaveBeenCalled();
        });

        it('should throw an error if fetching fails', async () => {
            poiRepoMock.findAllCheckpointPOIs.mockRejectedValue(new Error('Database error'));

            await expect(service.getAllPOIs()).rejects.toThrow('Database error');
        });
    });

    describe('getPOIById', () => {
        it('should return a POI by id', async () => {
            const mockPOI = { id: BigInt(1), name: 'POI 1' } as CheckpointPOIEntity;
            poiRepoMock.findCheckpointPOIById.mockResolvedValue(mockPOI);

            const result = await service.getPOIById(BigInt(1));
            expect(result).toEqual(mockPOI);
            expect(poiRepoMock.findCheckpointPOIById).toHaveBeenCalledWith(BigInt(1));
        });

        it('should throw NotFoundException if POI is not found', async () => {
            poiRepoMock.findCheckpointPOIById.mockResolvedValue(null);

            await expect(service.getPOIById(BigInt(1))).rejects.toThrow(NotFoundException);
        });
    });

    describe('updatePOIStatus', () => {
        it('should update POI status and comment', async () => {
            const mockPOI = { id: BigInt(1), name: 'POI 1', status: CheckpointStatus.ACTIVE } as CheckpointPOIEntity;
            poiRepoMock.findCheckpointPOIById.mockResolvedValue(mockPOI);
            poiRepoMock.updateCheckpointPOI.mockResolvedValue({ ...mockPOI, status: CheckpointStatus.INACTIVE, comment: 'Updated comment' });

            const result = await service.updatePOIStatus(BigInt(1), CheckpointStatus.INACTIVE, BigInt(2), 'Updated comment');
            expect(result.status).toBe(CheckpointStatus.INACTIVE);
            expect(result.comment).toBe('Updated comment');
            expect(poiRepoMock.updateCheckpointPOI).toHaveBeenCalledWith(BigInt(1), {
                status: CheckpointStatus.INACTIVE,
                statusUpdatedById: BigInt(2),
                comment: 'Updated comment'
            });
        });
    });


    describe('createPOI', () => {
        it('should create a new POI', async () => {
            const newPOI = { name: 'New POI', latitude: 0, longitude: 0, status: CheckpointStatus.ACTIVE, statusUpdatedById: BigInt(1) };
            const createdPOI = { id: BigInt(3), ...newPOI, lastUpdated: new Date() } as CheckpointPOIEntity;
            poiRepoMock.createCheckpointPOI.mockResolvedValue(createdPOI);

            const result = await service.createPOI(newPOI);
            expect(result).toEqual(createdPOI);
            expect(poiRepoMock.createCheckpointPOI).toHaveBeenCalledWith(newPOI);
        });
    });

    describe('deletePOI', () => {
        it('should delete a POI', async () => {
            await service.deletePOI(BigInt(1));
            expect(poiRepoMock.deleteCheckpointPOI).toHaveBeenCalledWith(BigInt(1));
        });

        it('should throw an error if deletion fails', async () => {
            poiRepoMock.deleteCheckpointPOI.mockRejectedValue(new Error('Deletion failed'));
            await expect(service.deletePOI(BigInt(1))).rejects.toThrow('Deletion failed');
        });
    });
});
