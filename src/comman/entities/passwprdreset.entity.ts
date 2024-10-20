export class PasswordResetEntity {
    id: bigint;
    userId: bigint;
    token: string;
    expiresAt: Date;
    createdAt: Date;

    constructor(data: Partial<PasswordResetEntity>) {
        Object.assign(this, data);
    }
}
