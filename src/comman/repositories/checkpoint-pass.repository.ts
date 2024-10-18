import { Injectable } from '@nestjs/common';
import { CheckpointPassEntity } from '../entities/checkpoint-pass.entity';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class CheckpointPassRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createCheckpointPass(data: Omit<CheckpointPassEntity, 'id' | 'passedAt'>): Promise<CheckpointPassEntity> {
        const checkpointPass = await this.prisma.checkpointPass.create({
            data: {
                ...data,
            },
        });
        return new CheckpointPassEntity(checkpointPass);
    }

    async findCheckpointPassById(id: bigint): Promise<CheckpointPassEntity | null> {
        const checkpointPass = await this.prisma.checkpointPass.findUnique({
            where: { id },
        });
        return checkpointPass ? new CheckpointPassEntity(checkpointPass) : null;
    }

    async updateCheckpointPass(id: bigint, data: Partial<CheckpointPassEntity>): Promise<CheckpointPassEntity> {
        const checkpointPass = await this.prisma.checkpointPass.update({
            where: { id },
            data,
        });
        return new CheckpointPassEntity(checkpointPass);
    }

    async deleteCheckpointPass(id: bigint): Promise<CheckpointPassEntity> {
        const checkpointPass = await this.prisma.checkpointPass.delete({
            where: { id },
        });
        return new CheckpointPassEntity(checkpointPass);
    }

    async findAllCheckpointPasses(): Promise<CheckpointPassEntity[]> {
        const checkpointPasses = await this.prisma.checkpointPass.findMany();
        return checkpointPasses.map(checkpointPass => new CheckpointPassEntity(checkpointPass));
    }
}
