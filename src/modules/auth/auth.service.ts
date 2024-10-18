import { Injectable, UnauthorizedException, UnprocessableEntityException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";
import { UserRepository } from "src/comman/repositories/user.repository";
import { signInDto } from "src/types/auth.types";

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

        const { password: _, ...userData } = user;

        res.cookie('jwt', this.jwtService.sign({ userData }), {
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
}
