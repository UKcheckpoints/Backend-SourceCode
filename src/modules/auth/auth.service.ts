import {
    BadRequestException,
    ConflictException,
    Injectable,
    UnauthorizedException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";
import { UserRepository } from "../../comman/repositories/user.repository";
import { RegisterDto, signInDto } from "../../types/auth.types";

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly jwtService: JwtService
    ) { }

    async signIn({ username, password }: signInDto, res: Response) {
        if (!username || !password) {
            throw new UnprocessableEntityException("Missing required fields. Please provide both username and password to proceed.");
        }

        const user = await this.userRepo.findUserByUsername(username);
        if (!user) {
            throw new UnauthorizedException("Invalid username. No user found with the provided username.");
        }
        const isPasswordValid = password === user.password;

        if (!isPasswordValid) {
            throw new UnauthorizedException("Invalid password. Please check your password and try again.");
        }
        const { password: _, id, ...userData } = user;
        const token = this.jwtService.sign(
            {
                sub: id.toString(),
                username: userData.username,
                role: userData.role,
                isSubscribed: userData.isSubscribed,
            },
            { expiresIn: '7d' }
        );

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return {
            message: "Sign-in successful",
            userData,
        };
    }

    async register(registerDto: RegisterDto) {
        const { username, email, password } = registerDto;

        if (!username || !email || !password) {
            throw new UnprocessableEntityException("Missing required fields. Please provide valid register to proceed.");
        }

        const existingUser = await this.userRepo.findUserByUsernameOrEmail(username, email);
        if (existingUser) {
            throw new ConflictException('Username or email already exists');
        }

        if (password.length < 8) {
            throw new BadRequestException('Password must be at least 8 characters long');
        }

        const newUser = await this.userRepo.createUser({
            username,
            email,
            password,
        });

        const { password: _, id, ...userData } = newUser;

        const token = this.jwtService.sign(
            {
                sub: id.toString(),
                username: userData.username,
                role: userData.role,
                isSubscribed: userData.isSubscribed,
            },
            { expiresIn: '7d' }
        );

        return {
            message: 'User registered successfully',
            user: userData,
            token,
        };
    }

    async validateCurrentUser(token: string) {
        if (!token) {
            throw new UnauthorizedException("Token is missing.");
        }

        try {
            const { sub, username, role, isSubscribed } = this.jwtService.verify(token);
            const user = await this.userRepo.findUserById(sub);

            if (!user) {
                throw new UnauthorizedException('Invalid token: User does not exist.');
            }

            if (
                user.username !== username ||
                user.role !== role ||
                user.isSubscribed !== isSubscribed
            ) {
                throw new UnauthorizedException('Token data does not match user data.');
            }

            return user;
        } catch (err) {
            throw new UnauthorizedException('Invalid token.');
        }
    }
}
