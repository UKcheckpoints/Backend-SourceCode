import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { MapService } from './map.service';
import { CheckpointPOIEntity } from 'src/comman/entities/checkpoint-poi.entity';
import { CheckpointStatus } from '@prisma/client';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('map')
//@UseGuards(JwtAuthGuard)
export class MapController {
    constructor(private readonly mapService: MapService) { }

    @Get('pois')
    async getAllPOIs(): Promise<CheckpointPOIEntity[]> {
        return this.mapService.getAllPOIs();
    }

    @Get('pois/:id')
    async getPOIById(@Param('id') id: string): Promise<CheckpointPOIEntity> {
        return this.mapService.getPOIById(BigInt(id));
    }

    @Put('pois/:id/status')
    async updatePOIStatus(
        @Param('id') id: string,
        @Body('status') status: CheckpointStatus,
        @Body('comment') comment: string,
        @Req() req: Request
    ): Promise<CheckpointPOIEntity> {
        const userId = (req.user as any).sub;
        return this.mapService.updatePOIStatus(BigInt(id), status, BigInt(userId), comment);
    }

    @Post('pois')
    async createPOI(@Body() poiData: Omit<CheckpointPOIEntity, 'id' | 'lastUpdated'>): Promise<CheckpointPOIEntity> {
        return this.mapService.createPOI(poiData);
    }

    @Delete('pois/:id')
    async deletePOI(@Param('id') id: string): Promise<void> {
        await this.mapService.deletePOI(BigInt(id));
    }
}
