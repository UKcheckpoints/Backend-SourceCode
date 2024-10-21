import { Controller, Get, Delete, Put, Param, Body, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
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

    @Delete('users/:id')
    async deleteUser(@Param('id') id: string, @Req() req: Request): Promise<void> {
        try {
            const token = req.cookies.jwt;
            await this.adminService.deleteUser(id, token);
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw new UnauthorizedException('Admin access required');
            }
            throw error;
        }
    }

    @Put('users/:id/role')
    async updateUserRole(@Param('id') id: string, @Body('role') role: string, @Req() req: Request): Promise<UserEntity> {
        try {
            const token = req.cookies.jwt;
            return await this.adminService.updateUserRole(id, role, token);
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw new UnauthorizedException('Admin access required');
            }
            throw error;
        }
    }
}
