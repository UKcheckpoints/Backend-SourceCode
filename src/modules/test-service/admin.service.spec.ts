import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
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

    describe('deleteUser', () => {
        it('should delete a user when admin is authenticated', async () => {
            authService.validateCurrentUser.mockResolvedValue({ data: mockUser('ADMIN'), id: '1' });
            userRepository.findUserById = jest.fn().mockResolvedValue(mockUser('USER'));
            userRepository.deleteUser = jest.fn().mockResolvedValue(undefined);

            await expect(adminService.deleteUser('1', 'token')).resolves.not.toThrow();
            expect(userRepository.deleteUser).toHaveBeenCalledWith(BigInt(1));
        });

        it('should throw UnauthorizedException for non-admin', async () => {
            authService.validateCurrentUser.mockResolvedValue({ data: mockUser('USER'), id: '1' });

            await expect(adminService.deleteUser('1', 'token')).rejects.toThrow(UnauthorizedException);
        });

        it('should throw NotFoundException when user does not exist', async () => {
            authService.validateCurrentUser.mockResolvedValue({ data: mockUser('ADMIN'), id: '1' });
            userRepository.findUserById = jest.fn().mockResolvedValue(null);

            await expect(adminService.deleteUser('1', 'token')).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateUserRole', () => {
        it('should update user role when admin is authenticated', async () => {
            const updatedUser = { ...mockUser('USER'), role: 'ADMIN' as Role };
            authService.validateCurrentUser.mockResolvedValue({ data: mockUser('ADMIN'), id: '1' });
            userRepository.findUserById = jest.fn().mockResolvedValue(mockUser('USER'));
            userRepository.updateUser = jest.fn().mockResolvedValue(updatedUser);

            const result = await adminService.updateUserRole('1', 'ADMIN', 'token');
            expect(result).toEqual(updatedUser);
            expect(userRepository.updateUser).toHaveBeenCalledWith(BigInt(1), { role: 'ADMIN' });
        });

        it('should throw UnauthorizedException for non-admin', async () => {
            authService.validateCurrentUser.mockResolvedValue({ data: mockUser('USER'), id: '1' });

            await expect(adminService.updateUserRole('1', 'ADMIN', 'token')).rejects.toThrow(UnauthorizedException);
        });

        it('should throw NotFoundException when user does not exist', async () => {
            authService.validateCurrentUser.mockResolvedValue({ data: mockUser('ADMIN'), id: '1' });
            userRepository.findUserById = jest.fn().mockResolvedValue(null);

            await expect(adminService.updateUserRole('1', 'ADMIN', 'token')).rejects.toThrow(NotFoundException);
        });

        it('should handle invalid role input', async () => {
            authService.validateCurrentUser.mockResolvedValue({ data: mockUser('ADMIN'), id: '1' });
            userRepository.findUserById = jest.fn().mockResolvedValue(mockUser('USER'));

            await expect(adminService.updateUserRole('1', 'INVALID_ROLE', 'token')).rejects.toThrow();
        });
    });
});
