import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserRepository } from "src/comman/repositories/user.repository";
import { PrismaService } from "src/comman/database/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";

@Module({
    providers: [PrismaService, UserRepository, AuthService, JwtService],
    controllers: [AuthController]
})

export class AuthModule { }