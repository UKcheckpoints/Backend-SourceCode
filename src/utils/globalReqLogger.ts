import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(RequestLoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const { method, url, body, params, query, headers, cookies, ip } = request;
        const start = Date.now();

        this.logWithBorder('⬅️  Incoming Request', `${method} ${url}`);
        this.logWithIcon('🌐', 'Client IP', ip);
        this.logWithIcon('📝', 'Request Headers', this.prettyPrint(headers));
        this.logWithIcon('🍪', 'Cookies', this.prettyPrint(cookies));
        this.logWithIcon('📝', 'Request Body', this.prettyPrint(body));
        this.logWithIcon('📝', 'Request Params', this.prettyPrint(params));
        this.logWithIcon('📝', 'Request Query', this.prettyPrint(query));

        return next.handle().pipe(
            map((responseData) => {
                const responseTime = Date.now() - start;
                this.logWithBorder('➡️  Response', `${response.statusCode} - ${method} ${url}`);
                this.logWithIcon('📝', 'Response Headers', this.prettyPrint(response.getHeaders()));
                this.logWithIcon('📝', 'Response Data', this.prettyPrint(responseData));
                this.logWithIcon('⏱', 'Response Time', `${responseTime}ms`);
                return responseData;
            }),
            tap(() => {
                const responseTime = Date.now() - start;
                this.logWithBorder('✅ Request Completed', `in ${responseTime}ms`);
            }),
        );
    }

    private prettyPrint(data: any): string {
        if (!data || !Object.keys(data).length) return '[Empty]';

        try {
            return JSON.stringify(data, this.replacer, 2);
        } catch (error) {
            return '[Error serializing data]';
        }
    }

    private replacer(key: string, value: any) {
        const seen = new WeakSet();
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    }

    private logWithBorder(title: string, message: string) {
        const borderChar = '═';
        const padding = 2;
        const width = Math.max(title.length, message.length) + padding * 2;
        const border = borderChar.repeat(width + 2);

        console.log(`╔${border}╗`);
        console.log(`║ ${title.padEnd(width)} ║`);
        console.log(`║ ${message.padEnd(width)} ║`);
        console.log(`╚${border}╝`);
    }

    private logWithIcon(icon: string, label: string, value: string) {
        console.log(`${icon} [${label}]: ${value}`);
    }
}