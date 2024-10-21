import { Test, TestingModule } from '@nestjs/testing';
import { PasswordResetRepository } from '../passwordreset.repository';
import { PrismaService } from 'src/comman/database/prisma/prisma.service';


describe('PasswordResetRepository', () => {
    let repository: PasswordResetRepository;
    let prismaService: { passwordReset: { create: jest.Mock; findUnique: jest.Mock; delete: jest.Mock; } };

    beforeEach(async () => {
        prismaService = {
            passwordReset: {
                create: jest.fn(),
                findUnique: jest.fn(),
                delete: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PasswordResetRepository,
                {
                    provide: PrismaService,
                    useValue: prismaService,
                },
            ],
        }).compile();
        repository = module.get<PasswordResetRepository>(PasswordResetRepository);
    });

    describe('createPasswordReset', () => {
        it('should create and return a PasswordResetEntity', async () => {
            const data = { userId: BigInt(1), token: 'sample-token', expiresAt: new Date() };
            const createdPasswordReset = { id: BigInt(1), ...data };
            prismaService.passwordReset.create.mockResolvedValue(createdPasswordReset);

            const result = await repository.createPasswordReset(data);
            expect(result).toEqual(expect.objectContaining({
                userId: data.userId,
                token: data.token,
            }));
            expect(prismaService.passwordReset.create).toHaveBeenCalledTimes(1);
            expect(prismaService.passwordReset.create).toHaveBeenCalledWith({ data });
        });
    });

    describe('findPasswordResetByToken', () => {
        it('should return PasswordResetEntity if found', async () => {
            const token = 'sample-token';
            const foundPasswordReset = { id: BigInt(1), userId: BigInt(1), token, expiresAt: new Date() };
            prismaService.passwordReset.findUnique.mockResolvedValue(foundPasswordReset);

            const result = await repository.findPasswordResetByToken(token);
            expect(result).toEqual(expect.objectContaining({
                token: foundPasswordReset.token,
            }));
            expect(prismaService.passwordReset.findUnique).toHaveBeenCalledWith({
                where: { token },
            });
        });

        it('should return null if not found', async () => {
            const token = 'non-existing-token';
            prismaService.passwordReset.findUnique.mockResolvedValue(null);

            const result = await repository.findPasswordResetByToken(token);
            expect(result).toBeNull();
        });
    });

    describe('deletePasswordReset', () => {
        it('should delete and return the deleted PasswordResetEntity', async () => {
            const id = BigInt(1);
            const deletedPasswordReset = { id, userId: BigInt(1), token: 'sample-token', expiresAt: new Date() };
            prismaService.passwordReset.delete.mockResolvedValue(deletedPasswordReset);

            const result = await repository.deletePasswordReset(id);
            expect(result).toEqual(expect.objectContaining({
                id,
                token: deletedPasswordReset.token,
            }));
            expect(prismaService.passwordReset.delete).toHaveBeenCalledWith({
                where: { id },
            });
        });
    });
});
