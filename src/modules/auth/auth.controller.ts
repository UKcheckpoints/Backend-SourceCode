import { Body, Controller, HttpStatus, Post, Res, UnauthorizedException, UnprocessableEntityException } from "@nestjs/common";
import { Response } from 'express';  // Import the Response type from express
import { RegisterDto, signInDto } from "src/types/auth.types";
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

    @Post('register')
    async register(@Body() data: RegisterDto, @Res() res: Response) {
        const result = await this.authServ.register(data);
        res.status(HttpStatus.CREATED).json(result);
    }
}
