import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import { UnauthorizedException, UnprocessableEntityException, HttpStatus } from '@nestjs/common';
import { RegisterDto, signInDto } from '../../types/auth.types';
import { Response } from 'express';
import { Role } from '@prisma/client';

describe('AuthController', () => {
    let authController: AuthController;
    let authService: AuthService;
    let mockResponse: Response;

    beforeEach(async () => {
        mockResponse = {
            cookie: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        signIn: jest.fn(),
                        register: jest.fn(),
                    },
                },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    describe('signInCont', () => {
        it('should call signIn and return result on successful sign-in', async () => {
            const signInData: signInDto = {
                username: 'testuser',
                password: 'password123',
            };

            const signInResult = {
                message: 'Sign-in successful',
                userData: {
                    id: 1n,
                    username: 'testuser',
                    email: 'testuser@example.com',
                    role: Role.USER,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isSubscribed: false,
                    freeEnd: false,
                },
            };

            jest.spyOn(authService, 'signIn').mockResolvedValue(signInResult);

            const result = await authController.signInCont(signInData, mockResponse);

            expect(authService.signIn).toHaveBeenCalledWith(signInData, mockResponse);
            expect(result).toEqual(signInResult);
        });

        it('should throw UnauthorizedException if signIn throws an UnauthorizedException', async () => {
            const signInData: signInDto = {
                username: 'testuser',
                password: 'password123',
            };

            jest.spyOn(authService, 'signIn').mockRejectedValue(new UnauthorizedException());

            await expect(authController.signInCont(signInData, mockResponse)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnprocessableEntityException if signIn throws an UnprocessableEntityException', async () => {
            const signInData: signInDto = {
                username: 'testuser',
                password: 'password123',
            };

            jest.spyOn(authService, 'signIn').mockRejectedValue(new UnprocessableEntityException());

            await expect(authController.signInCont(signInData, mockResponse)).rejects.toThrow(UnprocessableEntityException);
        });

        it('should throw UnauthorizedException for unexpected errors during sign-in', async () => {
            const signInData: signInDto = {
                username: 'testuser',
                password: 'password123',
            };

            jest.spyOn(authService, 'signIn').mockRejectedValue(new Error('Unexpected error'));

            await expect(authController.signInCont(signInData, mockResponse)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('register', () => {
        it('should call register and return result on successful registration', async () => {
            const registerData: RegisterDto = {
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'validpassword',
            };

            const registerResult = {
                message: 'User registered successfully',
                user: {
                    id: 1n,
                    username: 'newuser',
                    email: 'newuser@example.com',
                    role: Role.USER,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isSubscribed: true,
                    freeEnd: false,
                },
                token: 'signed-token',
            };

            jest.spyOn(authService, 'register').mockResolvedValue(registerResult);

            await authController.register(registerData, mockResponse);

            expect(authService.register).toHaveBeenCalledWith(registerData);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
            expect(mockResponse.json).toHaveBeenCalledWith(registerResult);
        });
    });
});
