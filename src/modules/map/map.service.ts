import { Injectable, OnModuleInit, Logger, NotFoundException } from "@nestjs/common";
import { CheckpointStatus } from "@prisma/client";
import * as fs from 'fs/promises';
import * as path from 'path';
import { CheckpointPOIEntity } from "src/comman/entities/checkpoint-poi.entity";
import { CheckpointPOIRepository } from "src/comman/repositories/checkpoint-poi.repository";
import { UserRepository } from "src/comman/repositories/user.repository";
import { CheckpointData } from "src/types/map.types";

@Injectable()
export class MapService implements OnModuleInit {
    private readonly logger = new Logger(MapService.name);

    constructor(
        private readonly poiRepo: CheckpointPOIRepository,
        private readonly userRepo: UserRepository
    ) { }

    async onModuleInit() {
        const filePath = path.join(__dirname, '../../../trucking.checkpoints.json');
        await this.loadCheckpointData(filePath);
    }

    private async loadCheckpointData(filePath: string): Promise<void> {
        try {
            const fileData = await fs.readFile(filePath, 'utf-8');
            const checkpointData: CheckpointData[] = JSON.parse(fileData);

            const existingCheckpoints = await this.poiRepo.findAllCheckpointPOIs();
            const existingNames = new Set(existingCheckpoints.map(cp => cp.name));

            const adminUser = await this.userRepo.findUserByUsername('Admin');
            const statusUpdatedById = adminUser ? adminUser.id : BigInt(1);

            for (const checkpoint of checkpointData) {
                await this.processCheckpoint(checkpoint, existingNames, statusUpdatedById);
            }
        } catch (error) {
            this.logger.error(`Error loading checkpoint data: ${error.message}`, error.stack);
        }
    }

    private async processCheckpoint(
        checkpoint: CheckpointData,
        existingNames: Set<string>,
        statusUpdatedById: bigint
    ): Promise<void> {
        const { name, latitude, longtitude, status } = checkpoint;

        if (existingNames.has(name)) {
            return;
        }

        const checkpointStatus = this.mapCheckpointStatus(status);

        try {
            await this.poiRepo.createCheckpointPOI({
                name,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longtitude),
                status: checkpointStatus,
                statusUpdatedById,
            });
            this.logger.log(`Created checkpoint: ${name}`);
        } catch (error) {
            this.logger.error(`Error creating checkpoint ${name}: ${error.message}`);
        }
    }

    private mapCheckpointStatus(status: string): CheckpointStatus {
        switch (status.toLowerCase()) {
            case "unknown":
                return CheckpointStatus.UNKNOWN;
            case "inactive":
                return CheckpointStatus.INACTIVE;
            default:
                return CheckpointStatus.ACTIVE;
        }
    }

    async getAllPOIs(): Promise<CheckpointPOIEntity[]> {
        try {
            return await this.poiRepo.findAllCheckpointPOIs();
        } catch (error) {
            this.logger.error(`Error fetching all POIs: ${error.message}`, error.stack);
            throw error;
        }
    }

    async getPOIById(id: bigint): Promise<CheckpointPOIEntity> {
        try {
            const poi = await this.poiRepo.findCheckpointPOIById(id);
            if (!poi) {
                throw new NotFoundException(`POI with ID ${id} not found`);
            }
            return poi;
        } catch (error) {
            this.logger.error(`Error fetching POI by ID ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }

    async updatePOIStatus(id: bigint, status: CheckpointStatus, userId: bigint, comment: string): Promise<CheckpointPOIEntity> {
        try {
            const poi = await this.getPOIById(id);
            return await this.poiRepo.updateCheckpointPOI(id, {
                status,
                statusUpdatedById: userId ?? BigInt(1),
                comment
            });
        } catch (error) {
            this.logger.error(`Error updating POI status for ID ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }

    async createPOI(data: Omit<CheckpointPOIEntity, 'id' | 'lastUpdated'>): Promise<CheckpointPOIEntity> {
        try {
            return await this.poiRepo.createCheckpointPOI(data);
        } catch (error) {
            this.logger.error(`Error creating new POI: ${error.message}`, error.stack);
            throw error;
        }
    }

    async deletePOI(id: bigint): Promise<void> {
        try {
            await this.poiRepo.deleteCheckpointPOI(id);
        } catch (error) {
            this.logger.error(`Error deleting POI with ID ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
}
