import { Body, Controller, Post, Res, UnauthorizedException, UnprocessableEntityException } from "@nestjs/common";
import { Response } from 'express';  // Import the Response type from express
import { signInDto } from "src/types/auth.types";
import { AuthService } from "./auth.service";

@Controller('user')
export class AuthController {
    constructor(private readonly authServ: AuthService) { }

    @Post('login')
    async signInCont(@Body() data: signInDto, @Res() res: Response) {
        try {
            return await this.authServ.signIn(data, res);
        } catch (err) {
            if (err instanceof UnauthorizedException || err instanceof UnprocessableEntityException) {
                throw err;
            }
            throw new UnauthorizedException("An unexpected error occurred during login.");
        }
    }
}
