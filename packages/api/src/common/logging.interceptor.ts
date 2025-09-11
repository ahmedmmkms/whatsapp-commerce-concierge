import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { MetricsService } from '../health/metrics.service.js';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly metrics?: MetricsService) {}

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
          this.metrics?.record(method, url, 200, ms);
        },
        error: (err) => {
          const ms = Date.now() - start;
          // eslint-disable-next-line no-console
          console.error(`[req] ${method} ${url} id=${reqId} ${ms}ms error=${err?.message || err}`);
          this.metrics?.record(method, url, 500, ms);
        },
      }),
    );
  }
}
