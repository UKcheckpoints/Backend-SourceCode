import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { AuthService } from "../auth/auth.service";
import { UserRepository } from "src/comman/repositories/user.repository";
import { JwtService } from "@nestjs/jwt";
import { PasswordResetRepository } from "src/comman/repositories/passwordreset.repository";
import { PrismaService } from "src/comman/database/prisma/prisma.service";
import { CheckpointPOIRepository } from "src/comman/repositories/checkpoint-poi.repository";

@Module({
    providers: [AdminService, AuthService, UserRepository, JwtService, PasswordResetRepository, PrismaService, CheckpointPOIRepository],
    controllers: [AdminController]
})

export class AdminModule { }