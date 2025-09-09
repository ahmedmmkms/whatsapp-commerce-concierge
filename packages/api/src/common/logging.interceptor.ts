import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { requestId?: string }>();
    const res = http.getResponse<Response>();
    const start = Date.now();
    const method = (req as any)?.method || 'N/A';
    const url = (req as any)?.url || 'N/A';
    const reqId = (req as any)?.requestId || (req as any)?.headers?.['x-request-id'];

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          // eslint-disable-next-line no-console
          console.log(`[req] ${method} ${url} id=${reqId} ${ms}ms`);
        },
        error: (err) => {
          const ms = Date.now() - start;
          // eslint-disable-next-line no-console
          console.error(`[req] ${method} ${url} id=${reqId} ${ms}ms error=${err?.message || err}`);
        },
      }),
    );
  }
}

