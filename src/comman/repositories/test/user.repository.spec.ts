import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma/prisma.service';
import { UserRepository } from '../../repositories/user.repository';
import { UserEntity } from '../../entities/user.entity';
import { Role } from '@prisma/client';

describe('UserRepository', () => {
    let userRepository: UserRepository;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UserRepository, {
                provide: PrismaService,
                useValue: {
                    user: {
                        create: jest.fn(),
                        findUnique: jest.fn(),
                        findFirst: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                        findMany: jest.fn(),
                    },
                },
            }],
        }).compile();

        userRepository = module.get<UserRepository>(UserRepository);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    afterEach(async () => {
        jest.clearAllMocks();
    });

    it('should create a new user', async () => {
        const userData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
        };

        const createdUser = {
            id: BigInt(1),
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            role: Role.USER,
            isSubscribed: false,
            stripeCustomer: '',
            freeEnd: true,
            freeDate: new Date(),
            interval: 'monthly',
            createdAt: new Date(),
            updatedAt: new Date(),
            stripeSubscribedDate: new Date()
        };

        jest.spyOn(prismaService.user, 'create').mockResolvedValue(createdUser);

        const result = await userRepository.createUser(userData);
        expect(result).toBeInstanceOf(UserEntity);
        expect(result).toEqual(new UserEntity(createdUser));
        expect(prismaService.user.create).toHaveBeenCalledWith({
            data: {
                ...userData,
                role: 'USER',
            }
        });
    });


    it('should find a user by ID', async () => {
        const userId = BigInt(1);
        const foundUser = {
            id: userId,
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            role: Role.USER,
            isSubscribed: false,
            stripeCustomer: '',
            freeEnd: true,
            freeDate: new Date(),
            interval: 'monthly',
            createdAt: new Date(),
            updatedAt: new Date(),
            stripeSubscribedDate: new Date()
        };

        jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(foundUser);

        const result = await userRepository.findUserById(userId);
        expect(result).toBeInstanceOf(UserEntity);
        expect(result).toEqual(new UserEntity(foundUser));
        expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('should return null if user not found by ID', async () => {
        const userId = BigInt(999);
        jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

        const result = await userRepository.findUserById(userId);
        expect(result).toBeNull();
        expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('should find a user by email', async () => {
        const email = 'test@example.com';
        const foundUser = {
            id: BigInt(1),
            username: 'testuser',
            email,
            password: 'password123',
            role: Role.USER,
            isSubscribed: false,
            stripeCustomer: '',
            freeEnd: true,
            freeDate: new Date(),
            interval: 'monthly',
            createdAt: new Date(),
            updatedAt: new Date(),
            stripeSubscribedDate: new Date()
        };


        jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(foundUser);

        const result = await userRepository.findUserByEmail(email);
        expect(result).toBeInstanceOf(UserEntity);
        expect(result).toEqual(new UserEntity(foundUser));
        expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
    });


    it('should find a user by username', async () => {
        const username = 'testuser';
        const foundUser = {
            id: BigInt(1),
            username,
            email: 'test@example.com',
            password: 'password123',
            role: Role.USER,
            isSubscribed: false,
            stripeCustomer: '',
            freeEnd: true,
            freeDate: new Date(),
            interval: 'monthly',
            createdAt: new Date(),
            updatedAt: new Date(),
            stripeSubscribedDate: new Date()
        };

        jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(foundUser);

        const result = await userRepository.findUserByUsername(username);
        expect(result).toBeInstanceOf(UserEntity);
        expect(result).toEqual(new UserEntity(foundUser));
        expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { username } });
    });

    it('should return null if user not found by username', async () => {
        const username = 'nonexistentuser';
        jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

        const result = await userRepository.findUserByUsername(username);
        expect(result).toBeNull();
        expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { username } });
    });

    it('should return null if user not found by email', async () => {
        const email = 'nonexistent@example.com';
        jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

        const result = await userRepository.findUserByEmail(email);
        expect(result).toBeNull();
        expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
    });

    it('should find a user by username or email', async () => {
        const username = 'testuser';
        const email = 'test@example.com';
        const foundUser = {
            id: BigInt(1),
            username,
            email,
            password: 'password123',
            role: Role.USER,
            isSubscribed: false,
            stripeCustomer: '',
            freeEnd: true,
            freeDate: new Date(),
            interval: 'monthly',
            createdAt: new Date(),
            updatedAt: new Date(),
            stripeSubscribedDate: new Date()
        };

        jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(foundUser);

        const result = await userRepository.findUserByUsernameOrEmail(username, email);
        expect(result).toBeInstanceOf(UserEntity);
        expect(result).toEqual(new UserEntity(foundUser));
        expect(prismaService.user.findFirst).toHaveBeenCalledWith({
            where: {
                OR: [
                    { username },
                    { email },
                ],
            },
        });
    });

    it('should return null if user not found by username or email', async () => {
        const username = 'nonexistentuser';
        const email = 'nonexistent@example.com';
        jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

        const result = await userRepository.findUserByUsernameOrEmail(username, email);
        expect(result).toBeNull();
        expect(prismaService.user.findFirst).toHaveBeenCalledWith({
            where: {
                OR: [
                    { username },
                    { email },
                ],
            },
        });
    });

    it('should update a user', async () => {
        const userId = BigInt(1);
        const updateData = { username: 'updateduser' };
        const updatedUser = {
            id: userId,
            username: 'updateduser',
            email: 'test@example.com',
            password: 'password123',
            role: Role.USER,
            isSubscribed: false,
            stripeCustomer: '',
            freeEnd: true,
            freeDate: new Date(),
            interval: 'monthly',
            createdAt: new Date(),
            updatedAt: new Date(),
            stripeSubscribedDate: new Date()
        };

        jest.spyOn(prismaService.user, 'update').mockResolvedValue(updatedUser);

        const result = await userRepository.updateUser(userId, updateData);
        expect(result).toBeInstanceOf(UserEntity);
        expect(result).toEqual(new UserEntity(updatedUser));
        expect(prismaService.user.update).toHaveBeenCalledWith({ where: { id: userId }, data: updateData });
    });

    it('should delete a user', async () => {
        const userId = BigInt(1);
        const deletedUser = {
            id: userId,
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            role: Role.USER,
            isSubscribed: false,
            stripeCustomer: '',
            freeEnd: true,
            freeDate: new Date(),
            interval: 'monthly',
            createdAt: new Date(),
            updatedAt: new Date(),
            stripeSubscribedDate: new Date()
        };

        jest.spyOn(prismaService.user, 'delete').mockResolvedValue(deletedUser);

        const result = await userRepository.deleteUser(userId);
        expect(result).toBeInstanceOf(UserEntity);
        expect(result).toEqual(new UserEntity(deletedUser));
        expect(prismaService.user.delete).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('should find all users', async () => {
        const users = [
            {
                id: BigInt(1),
                username: 'user1',
                email: 'user1@example.com',
                password: 'password123',
                role: Role.USER,
                isSubscribed: false,
                stripeCustomer: '',
                freeEnd: true,
                freeDate: new Date(),
                interval: 'monthly',
                createdAt: new Date(),
                updatedAt: new Date(),
                stripeSubscribedDate: new Date()
            },
            {
                id: BigInt(2),
                username: 'user2',
                email: 'user2@example.com',
                password: 'password456',
                role: Role.ADMIN,
                isSubscribed: false,
                stripeCustomer: '',
                freeEnd: true,
                freeDate: new Date(),
                interval: 'monthly',
                createdAt: new Date(),
                updatedAt: new Date(),
                stripeSubscribedDate: new Date()
            },
        ];

        jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(users);

        const result = await userRepository.findAllUsers();
        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(UserEntity);
        expect(result[0]).toEqual(new UserEntity(users[0]));
        expect(prismaService.user.findMany).toHaveBeenCalled();
    });
});
