import { Module } from "@nestjs/common";
import { PrismaService } from "./database/prisma/prisma.service";
import { UserRepository } from "./repositories/user.repository";
import { NotificationRepository } from "./repositories/notification.repository";
import { CheckpointPOIRepository } from "./repositories/checkpoint-poi.repository";
import { CheckpointPassRepository } from "./repositories/checkpoint-pass.repository";

@Module({
    providers: [
        PrismaService,
        UserRepository,
        NotificationRepository,
        CheckpointPOIRepository,
        CheckpointPassRepository
    ],
    exports: [
        UserRepository,
        NotificationRepository,
        CheckpointPOIRepository,
        CheckpointPassRepository
    ]
})

export class CommanModule { }