import { Controller, Get, Headers, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { CheckpointPOIEntity } from "src/comman/entities/checkpoint-poi.entity";
import { UserEntity } from "src/comman/entities/user.entity";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Request } from "express";

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('checkpoints')
    async getAllCheckPoints(@Req() req: Request): Promise<CheckpointPOIEntity[]> {
        try {
            const token = req.cookies.jwt;
            return await this.adminService.getAllCheckPoints(token);
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw new UnauthorizedException('Admin access required');
            }
            throw error;
        }
    }

    @Get('users')
    async getAllUsers(@Req() req: Request): Promise<UserEntity[]> {
        try {
            const token = req.cookies.jwt;
            return await this.adminService.getAllUsers(token);
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw new UnauthorizedException('Admin access required');
            }
            throw error;
        }
    }
}
