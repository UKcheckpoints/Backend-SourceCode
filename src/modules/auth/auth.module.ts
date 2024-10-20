import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserRepository } from "src/comman/repositories/user.repository";
import { PrismaService } from "src/comman/database/prisma/prisma.service";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtStrategy } from "./jwt.strategy";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { PasswordResetRepository } from "src/comman/repositories/passwordreset.repository";

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || "HACKME!Lol",
                signOptions: { expiresIn: '7d' },
            })
        })
    ],
    providers: [PrismaService, UserRepository, AuthService, JwtStrategy, JwtAuthGuard, PasswordResetRepository],
    controllers: [AuthController]
})

export class AuthModule { }