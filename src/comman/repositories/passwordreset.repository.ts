import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { PasswordResetEntity } from '../entities/passwprdreset.entity';

@Injectable()
export class PasswordResetRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createPasswordReset(data: { userId: bigint; token: string; expiresAt: Date }): Promise<PasswordResetEntity> {
        const passwordReset = await this.prisma.passwordReset.create({
            data
        });
        return new PasswordResetEntity(passwordReset);
    }

    async findPasswordResetByToken(token: string): Promise<PasswordResetEntity | null> {
        const passwordReset = await this.prisma.passwordReset.findUnique({
            where: { token }
        });
        return passwordReset ? new PasswordResetEntity(passwordReset) : null;
    }

    async deletePasswordReset(id: bigint): Promise<PasswordResetEntity> {
        const passwordReset = await this.prisma.passwordReset.delete({
            where: { id }
        });
        return new PasswordResetEntity(passwordReset);
    }
}
