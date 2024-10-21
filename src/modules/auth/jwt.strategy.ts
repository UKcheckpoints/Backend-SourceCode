import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                    return req.cookies.jwt;
                },
                ExtractJwt.fromAuthHeaderAsBearerToken()
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET', 'defaultSecretKey'),
        });
    }

    async validate(payload: any) {
        return {
            userId: payload.sub,
            username: payload.username,
            role: payload.role,
            isSubscribed: payload.isSubscribed
        };
    }
}
