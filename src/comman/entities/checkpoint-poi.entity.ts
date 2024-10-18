import { CheckpointStatus } from '@prisma/client';

export class CheckpointPOIEntity {
    id: bigint;
    name: string;
    status: CheckpointStatus;
    latitude: number;
    longitude: number;
    lastUpdated: Date;
    statusUpdatedById: bigint;
    comment?: string;

    constructor(data: Partial<CheckpointPOIEntity>) {
        Object.assign(this, data);
    }
}
