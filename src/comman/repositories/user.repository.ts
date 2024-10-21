import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class UserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createUser(data: { username: string; email: string; password: string }): Promise<UserEntity> {
        const user = await this.prisma.user.create({
            data: {
                ...data,
                role: 'USER',
            },
        });
        return new UserEntity(user);
    }

    async findUserById(id: bigint): Promise<UserEntity | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        return user ? new UserEntity(user) : null;
    }

    async findUserByEmail(email: string): Promise<UserEntity | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        return user ? new UserEntity(user) : null;
    }

    async findUserByUsername(username: string): Promise<UserEntity | null> {
        const user = await this.prisma.user.findUnique({
            where: { username },
        });
        return user ? new UserEntity(user) : null;
    }

    async findUserByUsernameOrEmail(username: string, email: string): Promise<UserEntity | null> {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email },
                ],
            },
        });
        return user ? new UserEntity(user) : null;
    }

    async updateUser(id: bigint, data: Partial<UserEntity>): Promise<UserEntity> {
        const user = await this.prisma.user.update({
            where: { id },
            data,
        });
        return new UserEntity(user);
    }

    async deleteUser(id: bigint): Promise<UserEntity> {
        const user = await this.prisma.user.delete({
            where: { id },
        });
        return new UserEntity(user);
    }

    async findAllUsers(): Promise<UserEntity[]> {
        const users = await this.prisma.user.findMany();
        return users.map(user => new UserEntity(user));
    }

    async findUserByCustomerId(customerId: string): Promise<UserEntity | null> {
        const user = await this.prisma.user.findFirst({
            where: { stripeCustomer: customerId },
        });
        return user ? new UserEntity(user) : null;
    }
}
