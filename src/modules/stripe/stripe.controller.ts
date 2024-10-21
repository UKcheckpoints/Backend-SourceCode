import { Controller, Post, Req, Res, HttpException, HttpStatus } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Request, Response } from 'express';

@Controller('stripe')
export class StripeController {
    constructor(private readonly stripeService: StripeService) { }

    @Post('webhook')
    async handleStripeWebhook(@Req() req: Request, @Res() res: Response) {
        try {
            const result = this.stripeService.handleWebhook(req);
            res.status(HttpStatus.OK).json(result);
        } catch (err) {
            throw new HttpException('Webhook Error: ' + err.message, HttpStatus.BAD_REQUEST);
        }
    }
}
