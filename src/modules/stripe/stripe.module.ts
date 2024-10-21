import { Module } from "@nestjs/common";
import { StripeService } from "./stripe.service";
import { StripeController } from "./stripe.controller";
import { PrismaService } from "src/comman/database/prisma/prisma.service";
import { UserRepository } from "src/comman/repositories/user.repository";

@Module({
    providers: [StripeService, PrismaService, UserRepository],
    controllers: [StripeController]
})

export class StripeModule { }