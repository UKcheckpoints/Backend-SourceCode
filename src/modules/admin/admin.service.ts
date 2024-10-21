import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { CheckpointPOIRepository } from "src/comman/repositories/checkpoint-poi.repository";
import { CheckpointPOIEntity } from "src/comman/entities/checkpoint-poi.entity";
import { UserRepository } from "src/comman/repositories/user.repository";
import { UserEntity } from "src/comman/entities/user.entity";

@Injectable()
export class AdminService {
    constructor(
        private readonly authService: AuthService,
        private readonly checkpointsRepository: CheckpointPOIRepository,
        private readonly userRepository: UserRepository
    ) { }

    private async validateAdmin(token: string): Promise<boolean> {
        const user = await this.authService.validateCurrentUser(token);
        return user && user.data && (user.data.role === "ADMIN" || user.data.role === "SUPER_ADMIN");
    }

    async getAllCheckPoints(token: string): Promise<CheckpointPOIEntity[]> {
        const isAdmin = await this.validateAdmin(token);
        if (!isAdmin) {
            throw new UnauthorizedException('Admin access required');
        }
        return this.checkpointsRepository.findAllCheckpointPOIs();
    }

    async getAllUsers(token: string): Promise<UserEntity[]> {
        const isAdmin = await this.validateAdmin(token);
        if (!isAdmin) {
            throw new UnauthorizedException('Admin access required');
        }
        return this.userRepository.findAllUsers();
    }
}
