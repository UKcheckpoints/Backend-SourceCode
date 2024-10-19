import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { UserRepository } from '../../comman/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, ConflictException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { Response } from 'express';
import { RegisterDto, signInDto } from '../../types/auth.types';

describe('AuthService', () => {
    let authService: AuthService;
    let userRepo: UserRepository;
    let jwtService: JwtService;

    const mockUserRepo = {
        findUserByUsername: jest.fn(),
        findUserByUsernameOrEmail: jest.fn(),
        createUser: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn(),
    };

    const mockResponse: Partial<Response> = {
        cookie: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UserRepository, useValue: mockUserRepo },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        userRepo = module.get<UserRepository>(UserRepository);
        jwtService = module.get<JwtService>(JwtService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('signIn', () => {
        it('should throw UnprocessableEntityException if username or password is missing', async () => {
            const dto: signInDto = { username: '', password: '' };

            await expect(authService.signIn(dto, mockResponse as Response)).rejects.toThrow(UnprocessableEntityException);
        });

        it('should throw UnauthorizedException if user is not found', async () => {
            const dto: signInDto = { username: 'nonexistent', password: 'password123' };
            mockUserRepo.findUserByUsername.mockResolvedValue(null);

            await expect(authService.signIn(dto, mockResponse as Response)).rejects.toThrow(UnauthorizedException);
            expect(mockUserRepo.findUserByUsername).toHaveBeenCalledWith('nonexistent');
        });

        it('should throw UnauthorizedException if password is incorrect', async () => {
            const dto: signInDto = { username: 'testuser', password: 'wrongpassword' };
            mockUserRepo.findUserByUsername.mockResolvedValue({ username: 'testuser', password: 'correctpassword' });

            await expect(authService.signIn(dto, mockResponse as Response)).rejects.toThrow(UnauthorizedException);
        });

        it('should set a cookie and return user data on successful sign-in', async () => {
            const dto: signInDto = { username: 'testuser', password: 'correctpassword' };
            const user = { username: 'testuser', password: 'correctpassword', id: 1, email: 'test@example.com' };
            mockUserRepo.findUserByUsername.mockResolvedValue(user);
            mockJwtService.sign.mockReturnValue('signed-token');

            const result = await authService.signIn(dto, mockResponse as Response);

            expect(mockResponse.cookie).toHaveBeenCalledWith('jwt', 'signed-token', {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            expect(result).toEqual({
                message: 'Sign-in successful',
                userData: {
                    username: 'testuser',
                    email: 'test@example.com',
                },
            });
        });
    });

    describe('register', () => {
        it('should throw ConflictException if username or email already exists', async () => {
            const dto: RegisterDto = { username: 'testuser', email: 'test@example.com', password: 'password123' };
            mockUserRepo.findUserByUsernameOrEmail.mockResolvedValue({});

            await expect(authService.register(dto)).rejects.toThrow(ConflictException);
            expect(mockUserRepo.findUserByUsernameOrEmail).toHaveBeenCalledWith('testuser', 'test@example.com');
        });

        it('should throw BadRequestException if password is less than 8 characters', async () => {
            const dto: RegisterDto = { username: 'testuser', email: 'test@example.com', password: 'short' };
            mockUserRepo.findUserByUsernameOrEmail.mockResolvedValue(null);

            await expect(authService.register(dto)).rejects.toThrow(BadRequestException);
        });

        it('should create a new user and return user data and token on successful registration', async () => {
            const dto: RegisterDto = { username: 'newuser', email: 'new@example.com', password: 'password123' };
            const newUser = { id: 1, username: 'newuser', email: 'new@example.com', password: 'password123' };
            mockUserRepo.findUserByUsernameOrEmail.mockResolvedValue(null);
            mockUserRepo.createUser.mockResolvedValue(newUser);
            mockJwtService.sign.mockReturnValue('signed-token');

            const result = await authService.register(dto);

            expect(mockUserRepo.createUser).toHaveBeenCalledWith({
                username: 'newuser',
                email: 'new@example.com',
                password: 'password123',
            });

            expect(result).toEqual({
                message: 'User registered successfully',
                user: {
                    id: 1,
                    username: 'newuser',
                    email: 'new@example.com',
                },
                token: 'signed-token',
            });
        });
    });

    describe('validateCurrentUser', () => {
        it('should throw UnauthorizedException if token is missing', async () => {
            await expect(authService.validateCurrentUser(null)).rejects.toThrow(UnauthorizedException);
            await expect(authService.validateCurrentUser('')).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if user does not exist', async () => {
            const token = jwtService.sign({ sub: 1 });
            jwtService.verify = jest.fn().mockReturnValue({ sub: 1 });
            userRepo.findUserById = jest.fn().mockResolvedValue(null);

            await expect(authService.validateCurrentUser(token)).rejects.toThrow(UnauthorizedException);
            await expect(userRepo.findUserById).toHaveBeenCalledWith(1);
        });

        it('should throw UnauthorizedException if token data does not match user data', async () => {
            const token = jwtService.sign({ sub: 1, username: 'testuser', role: 'user', isSubscribed: true });
            jwtService.verify = jest.fn().mockReturnValue({ sub: 1, username: 'testuser', role: 'user', isSubscribed: true });
            userRepo.findUserById = jest.fn().mockResolvedValue({ username: 'differentUser', role: 'admin', isSubscribed: false });

            await expect(authService.validateCurrentUser(token)).rejects.toThrow(UnauthorizedException);
        });

        it('should return the user if token is valid and matches user data', async () => {
            const user = { id: 1, username: 'testuser', role: 'user', isSubscribed: true };
            const token = jwtService.sign({ sub: user.id, username: user.username, role: user.role, isSubscribed: user.isSubscribed });
            jwtService.verify = jest.fn().mockReturnValue({ sub: user.id, username: user.username, role: user.role, isSubscribed: user.isSubscribed });
            userRepo.findUserById = jest.fn().mockResolvedValue(user);

            const result = await authService.validateCurrentUser(token);
            expect(result).toEqual(user);
        });
    });
});
