import { Role } from '@prisma/client';

export class UserEntity {
    id: bigint;
    username: string;
    email: string;
    password: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
    freeDate?: Date;
    interval?: string;
    isSubscribed: boolean;
    stripeCustomer?: string;
    stripeSubscribedDate?: Date;
    freeEnd: boolean;

    constructor(data: Partial<UserEntity>) {
        Object.assign(this, data);
    }
}
