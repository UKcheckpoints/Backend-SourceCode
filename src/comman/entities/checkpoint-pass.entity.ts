import { CheckpointStatus } from '@prisma/client';

export class CheckpointPassEntity {
    id: bigint;
    userId: bigint;
    checkpointId: bigint;
    passedAt: Date;
    status: CheckpointStatus;
    comment?: string;

    constructor(data: Partial<CheckpointPassEntity>) {
        Object.assign(this, data);
    }
}
