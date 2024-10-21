import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { CheckpointPOIRepository } from 'src/comman/repositories/checkpoint-poi.repository';
import { UserRepository } from 'src/comman/repositories/user.repository';
import { CheckpointPOIEntity } from 'src/comman/entities/checkpoint-poi.entity';
import { UserEntity } from 'src/comman/entities/user.entity';
import { AdminService } from '../admin/admin.service';
import { Role } from '@prisma/client';

describe('AdminService', () => {
    let adminService: AdminService;
    let authService: jest.Mocked<AuthService>;
    let checkpointsRepository: jest.Mocked<CheckpointPOIRepository>;
    let userRepository: jest.Mocked<UserRepository>;

    const mockUser = (role: string): UserEntity => ({
        id: BigInt(1),
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: role as Role,
        createdAt: new Date(),
        updatedAt: new Date(),
        isSubscribed: false,
        freeEnd: false,
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AdminService,
                {
                    provide: AuthService,
                    useValue: {
                        validateCurrentUser: jest.fn(),
                    },
                },
                {
                    provide: CheckpointPOIRepository,
                    useValue: {
                        findAllCheckpointPOIs: jest.fn(),
                    },
                },
                {
                    provide: UserRepository,
                    useValue: {
                        findAllUsers: jest.fn(),
                    },
                },
            ],
        }).compile();

        adminService = module.get<AdminService>(AdminService);
        authService = module.get(AuthService);
        checkpointsRepository = module.get(CheckpointPOIRepository);
        userRepository = module.get(UserRepository);
    });

    describe('validateAdmin', () => {
        it('should return true for ADMIN role', async () => {
            authService.validateCurrentUser.mockResolvedValue({ data: mockUser('ADMIN'), id: '1' });
            const result = await adminService['validateAdmin']('token');
            expect(result).toBe(true);
        });

        it('should return true for SUPER_ADMIN role', async () => {
            authService.validateCurrentUser.mockResolvedValue({ data: mockUser('SUPER_ADMIN'), id: '1' });
            const result = await adminService['validateAdmin']('token');
            expect(result).toBe(true);
        });

        it('should return false for non-admin role', async () => {
            authService.validateCurrentUser.mockResolvedValue({ data: mockUser('USER'), id: '1' });
            const result = await adminService['validateAdmin']('token');
            expect(result).toBe(false);
        });

        it('should return false for invalid user', async () => {
            authService.validateCurrentUser.mockResolvedValue(null);
            const result = await adminService['validateAdmin']('token');
            expect(result).toBe(false);
        });
    });

    describe('getAllCheckPoints', () => {
        it('should return all checkpoints for admin', async () => {
            const mockCheckpoints: CheckpointPOIEntity[] = [{ id: 1n } as CheckpointPOIEntity];
            authService.validateCurrentUser.mockResolvedValue({ data: mockUser('ADMIN'), id: '1' });
            checkpointsRepository.findAllCheckpointPOIs.mockResolvedValue(mockCheckpoints);

            const result = await adminService.getAllCheckPoints('token');
            expect(result).toEqual(mockCheckpoints);
        });

        it('should throw UnauthorizedException for non-admin', async () => {
            authService.validateCurrentUser.mockResolvedValue({ data: mockUser('USER'), id: '1' });

            await expect(adminService.getAllCheckPoints('token')).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('getAllUsers', () => {
        it('should return all users for admin', async () => {
            const mockUsers: UserEntity[] = [mockUser('USER')];
            authService.validateCurrentUser.mockResolvedValue({ data: mockUser('ADMIN'), id: '1' });
            userRepository.findAllUsers.mockResolvedValue(mockUsers);

            const result = await adminService.getAllUsers('token');
            expect(result).toEqual(mockUsers);
        });

        it('should throw UnauthorizedException for non-admin', async () => {
            authService.validateCurrentUser.mockResolvedValue({ data: mockUser('USER'), id: '1' });

            await expect(adminService.getAllUsers('token')).rejects.toThrow(UnauthorizedException);
        });
    });
});
