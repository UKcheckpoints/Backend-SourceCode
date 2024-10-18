export class NotificationEntity {
    id: bigint;
    userId?: bigint;
    title: string;
    message: string;
    createdAt: Date;
    sentById: bigint;

    constructor(data: Partial<NotificationEntity>) {
        Object.assign(this, data);
    }
}
