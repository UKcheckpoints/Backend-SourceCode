import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class BigIntSerializerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const originalJson = res.json;
        res.json = function (body) {
            body = JSON.parse(JSON.stringify(body, (key, value) => {
                if (typeof value === 'bigint') {
                    const num = Number(value);
                    if (num.toString() === value.toString()) {
                        return num;
                    } else {
                        return value.toString();
                    }
                }
                return value;
            }));
            return originalJson.call(this, body);
        };
        next();
    }
}
