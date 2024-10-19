import { Body, Controller, Get, HttpStatus, Post, Req, Res, UnauthorizedException, UnprocessableEntityException, UseGuards } from "@nestjs/common";
import { Response, Request } from 'express';
import { RegisterDto, signInDto } from "src/types/auth.types";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Controller('user')
export class AuthController {
    constructor(private readonly authServ: AuthService) { }

    @Post('login')
    async signInCont(@Body() data: signInDto, @Res() res: Response) {
        try {
            const token = await this.authServ.signIn(data, res);
            return res.status(HttpStatus.OK).json({
                message: 'Login successful',
                token,
            });
        } catch (err) {
            if (err instanceof UnauthorizedException || err instanceof UnprocessableEntityException) {
                throw err;
            }
            throw new UnauthorizedException("An unexpected error occurred during login.");
        }
    }

    @Post('register')
    async register(@Body() data: RegisterDto, @Res() res: Response) {
        try {
            await this.authServ.register(data);
            return res.status(HttpStatus.CREATED).json({
                message: 'Registration successful. Please log in.',
            });
        } catch (error) {
            return res.status(error.status || 500).json({
                message: error.message || 'Internal Server Error',
            });
        }
    }

    @Get('validate-jwt')
    @UseGuards(JwtAuthGuard)
    async validateJwt(@Req() req: Request, @Res() res: Response) {
        const token = req.cookies.jwt;

        try {
            const userData = await this.authServ.validateCurrentUser(token);
            return res.status(HttpStatus.OK).json({
                message: 'Token is valid',
                userData,
            });
        } catch (err) {
            console.log(err)
            throw new UnauthorizedException('Invalid token.');
        }
    }
}
