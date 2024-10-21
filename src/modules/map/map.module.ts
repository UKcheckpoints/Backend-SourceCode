import { Module } from "@nestjs/common";
import { MapService } from "./map.service";
import { UserRepository } from "src/comman/repositories/user.repository";
import { CheckpointPOIRepository } from "src/comman/repositories/checkpoint-poi.repository";
import { PrismaService } from "src/comman/database/prisma/prisma.service";
import { MapController } from "./map.controller";

@Module({
    providers: [PrismaService, CheckpointPOIRepository, UserRepository, MapService],
    controllers: [MapController]
})

export class MapModule { }