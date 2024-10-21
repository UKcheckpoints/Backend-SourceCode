import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UserRepository } from 'src/comman/repositories/user.repository';

@Injectable()
export class StripeService {
    private readonly stripe: Stripe;
    private readonly webhookSecret: string;
    private readonly logger = new Logger(StripeService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly userRepository: UserRepository,
    ) {
        this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
            apiVersion: "2024-09-30.acacia",
        });
        this.webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    }

    async handleWebhook(req: Request) {
        const sig = req.headers['stripe-signature'] as string;

        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(req.body, sig, this.webhookSecret);
        } catch (err) {
            this.logger.error('Webhook signature verification failed.', err.message);
            throw new Error('Webhook Error: Invalid Signature');
        }

        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                this.logger.log(`PaymentIntent was successful: ${paymentIntent.id}`);
                break;

            case 'customer.created':
                const customer = event.data.object as Stripe.Customer;
                if (customer.email) {
                    await this.updateUserWithStripeCustomerId(customer.email, customer.id);
                }
                this.logger.log(`Customer created with ID: ${customer.id}`);
                break;

            case 'customer.subscription.created':
                const subscription = event.data.object as Stripe.Subscription;
                if (subscription.customer && typeof subscription.customer === 'string') {
                    await this.updateUserSubscription(subscription.customer, true, new Date(subscription.current_period_start * 1000));
                }
                this.logger.log(`Subscription created: ${subscription.id}`);
                break;

            case 'customer.subscription.deleted':
                const deletedSubscription = event.data.object as Stripe.Subscription;
                if (deletedSubscription.customer && typeof deletedSubscription.customer === 'string') {
                    await this.updateUserSubscription(deletedSubscription.customer, false);
                }
                this.logger.log(`Subscription canceled: ${deletedSubscription.id}`);
                break;

            case 'invoice.payment_succeeded':
                const invoice = event.data.object as Stripe.Invoice;
                this.logger.log(`Invoice payment succeeded: ${invoice.id}`);
                break;

            default:
                this.logger.warn(`Unhandled event type: ${event.type}`);
        }

        return { received: true };
    }

    private async updateUserWithStripeCustomerId(email: string, customerId: string) {
        const user = await this.userRepository.findUserByEmail(email);
        if (user) {
            await this.userRepository.updateUser(user.id, { stripeCustomer: customerId });
            this.logger.log(`Updated user ${user.id} with Stripe customer ID: ${customerId}`);
        } else {
            this.logger.warn(`No user found with email: ${email}`);
        }
    }

    private async updateUserSubscription(customerId: string, isSubscribed: boolean, stripeSubscribedDate?: Date) {
        const user = await this.userRepository.findUserByCustomerId(customerId);
        if (user) {
            await this.userRepository.updateUser(user.id, { isSubscribed, stripeSubscribedDate });
            this.logger.log(`Updated user ${user.id} subscription status: ${isSubscribed}`);
        } else {
            this.logger.warn(`No user found with Stripe customer ID: ${customerId}`);
        }
    }
}
