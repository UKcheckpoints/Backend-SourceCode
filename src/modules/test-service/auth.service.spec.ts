import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { UserRepository } from '../../comman/repositories/user.repository';
import { PasswordResetRepository } from '../../comman/repositories/passwordreset.repository';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { Response } from 'express';
import { RegisterDto, signInDto } from '../../types/auth.types';
import * as sgMail from '@sendgrid/mail';
import { v4 as uuidv4 } from 'uuid';

jest.mock('@sendgrid/mail', () => ({
    setApiKey: jest.fn(),
    send: jest.fn(),
}));

jest.mock('uuid', () => ({
    v4: jest.fn(),
}));

describe('AuthService', () => {
    let authService: AuthService;
    let userRepo: UserRepository;
    let passwordResetRepo: PasswordResetRepository;
    let jwtService: JwtService;

    const mockUserRepo = {
        findUserByUsername: jest.fn(),
        findUserByUsernameOrEmail: jest.fn(),
        createUser: jest.fn(),
        findUserByEmail: jest.fn(),
        findUserById: jest.fn(),
        updateUser: jest.fn(),
    };

    const mockPasswordResetRepo = {
        createPasswordReset: jest.fn(),
        findPasswordResetByToken: jest.fn(),
        deletePasswordReset: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn(),
        verify: jest.fn(),
    };

    const mockResponse: Partial<Response> = {
        cookie: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UserRepository, useValue: mockUserRepo },
                { provide: PasswordResetRepository, useValue: mockPasswordResetRepo },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        userRepo = module.get<UserRepository>(UserRepository);
        passwordResetRepo = module.get<PasswordResetRepository>(PasswordResetRepository);
        jwtService = module.get<JwtService>(JwtService);

        process.env.FRONTEND_URL = 'http://example.com';
        process.env.SENDGRID_RESET_PASSWORD_TEMPLATE_ID = 'template-id';
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
            expect(mockResponse.cookie).toHaveBeenCalledWith('jwt', 'signed-token', expect.objectContaining({
                httpOnly: true,
                secure: true,
                sameSite: expect.any(String),
                maxAge: 7 * 24 * 60 * 60 * 1000,
            }));

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
            const user = {
                id: 1,
                username: 'testuser',
                role: 'user',
                isSubscribed: true
            };

            const token = jwtService.sign({
                sub: user.id,
                username: user.username,
                role: user.role,
                isSubscribed: user.isSubscribed
            });

            jwtService.verify = jest.fn().mockReturnValue({
                sub: user.id,
                username: user.username,
                role: user.role,
                isSubscribed: user.isSubscribed
            });

            userRepo.findUserById = jest.fn().mockResolvedValue(user);

            const result = await authService.validateCurrentUser(token);

            expect(result).toEqual({
                id: "1",
                data: {
                    username: "testuser",
                    role: "user",
                    isSubscribed: true,
                },
            });
        });
    });

    describe('requestPasswordReset', () => {
        it('should throw NotFoundException if user is not found', async () => {
            mockUserRepo.findUserByEmail.mockResolvedValue(null);

            await expect(authService.requestPasswordReset('nonexistent@example.com'))
                .rejects.toThrow(NotFoundException);
        });

        it('should create a password reset token and send an email', async () => {
            const mockUser = { id: BigInt(1), email: 'test@example.com' };
            mockUserRepo.findUserByEmail.mockResolvedValue(mockUser);

            const mockUuid = 'mock-uuid';
            (uuidv4 as jest.Mock).mockReturnValue(mockUuid);

            await authService.requestPasswordReset('test@example.com');

            expect(mockPasswordResetRepo.createPasswordReset).toHaveBeenCalledWith({
                userId: mockUser.id,
                token: mockUuid,
                expiresAt: expect.any(Date),
            });

            expect(sgMail.send).toHaveBeenCalledWith({
                to: 'test@example.com',
                from: { email: 'info@ukcheckpoints.info', name: 'noreply' },
                templateId: 'template-id',
                dynamicTemplateData: {
                    reset_password_link: expect.stringContaining(`/reset-password?token=${mockUuid}`),
                },
            });
        });


        it('should return a success message', async () => {
            mockUserRepo.findUserByEmail.mockResolvedValue({ id: BigInt(1), email: 'test@example.com' });

            const result = await authService.requestPasswordReset('test@example.com');

            expect(result).toEqual({ message: 'Password reset email sent successfully' });
        });

        it('should throw an error if email sending fails', async () => {
            mockUserRepo.findUserByEmail.mockResolvedValue({ id: BigInt(1), email: 'test@example.com' });
            (sgMail.send as jest.Mock).mockRejectedValue(new Error('Email sending failed'));

            await expect(authService.requestPasswordReset('test@example.com'))
                .rejects.toThrow('Email sending failed');
        });
    });

    describe('resetPassword', () => {
        it('should reset the password successfully', async () => {
            const mockToken = 'valid-token';
            const mockNewPassword = 'newPassword123';
            const mockPasswordReset = {
                id: BigInt(1),
                userId: BigInt(1),
                token: mockToken,
                expiresAt: new Date(Date.now() + 3600000),
            };
            const mockUser = { id: BigInt(1), email: 'test@example.com' };

            mockPasswordResetRepo.findPasswordResetByToken.mockResolvedValue(mockPasswordReset);
            mockUserRepo.findUserById.mockResolvedValue(mockUser);
            mockUserRepo.updateUser.mockResolvedValue({ ...mockUser, password: mockNewPassword });
            mockPasswordResetRepo.deletePasswordReset.mockResolvedValue(null);

            const result = await authService.resetPassword(mockToken, mockNewPassword);

            expect(result).toEqual({ message: 'Password has been reset successfully' });
            expect(mockUserRepo.updateUser).toHaveBeenCalledWith(mockUser.id, { password: mockNewPassword });
            expect(mockPasswordResetRepo.deletePasswordReset).toHaveBeenCalledWith(mockPasswordReset.id);
        });

        it('should throw NotFoundException for invalid token', async () => {
            mockPasswordResetRepo.findPasswordResetByToken.mockResolvedValue(null);

            await expect(authService.resetPassword('invalid-token', 'newPassword123'))
                .rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException for expired token', async () => {
            const mockExpiredPasswordReset = {
                id: BigInt(1),
                userId: BigInt(1),
                token: 'expired-token',
                expiresAt: new Date(Date.now() - 3600000),
            };

            mockPasswordResetRepo.findPasswordResetByToken.mockResolvedValue(mockExpiredPasswordReset);

            await expect(authService.resetPassword('expired-token', 'newPassword123'))
                .rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException for short password', async () => {
            const mockPasswordReset = {
                id: BigInt(1),
                userId: BigInt(1),
                token: 'valid-token',
                expiresAt: new Date(Date.now() + 3600000),
            };
            const mockUser = { id: BigInt(1), email: 'test@example.com' };

            mockPasswordResetRepo.findPasswordResetByToken.mockResolvedValue(mockPasswordReset);
            mockUserRepo.findUserById.mockResolvedValue(mockUser);

            await expect(authService.resetPassword('valid-token', 'short'))
                .rejects.toThrow(BadRequestException);
        });
    });

});
