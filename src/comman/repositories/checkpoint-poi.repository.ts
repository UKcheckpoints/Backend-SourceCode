import { Injectable } from '@nestjs/common';
import { CheckpointPOIEntity } from '../entities/checkpoint-poi.entity';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class CheckpointPOIRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createCheckpointPOI(data: Omit<CheckpointPOIEntity, 'id' | 'lastUpdated'>): Promise<CheckpointPOIEntity> {
        const checkpointPOI = await this.prisma.checkpointPOI.create({
            data: {
                ...data,
            },
        });
        return new CheckpointPOIEntity(checkpointPOI);
    }

    async findCheckpointPOIById(id: bigint): Promise<CheckpointPOIEntity | null> {
        const checkpointPOI = await this.prisma.checkpointPOI.findUnique({
            where: { id },
        });
        return checkpointPOI ? new CheckpointPOIEntity(checkpointPOI) : null;
    }

    async updateCheckpointPOI(id: bigint, data: Partial<CheckpointPOIEntity>): Promise<CheckpointPOIEntity> {
        const checkpointPOI = await this.prisma.checkpointPOI.update({
            where: { id },
            data,
        });
        return new CheckpointPOIEntity(checkpointPOI);
    }

    async deleteCheckpointPOI(id: bigint): Promise<CheckpointPOIEntity> {
        const checkpointPOI = await this.prisma.checkpointPOI.delete({
            where: { id },
        });
        return new CheckpointPOIEntity(checkpointPOI);
    }

    async findAllCheckpointPOIs(): Promise<CheckpointPOIEntity[]> {
        const checkpoints = await this.prisma.checkpointPOI.findMany();
        return checkpoints.map(checkpoint => new CheckpointPOIEntity(checkpoint));
    }
}
