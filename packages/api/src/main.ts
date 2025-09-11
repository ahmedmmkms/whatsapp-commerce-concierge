import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Logger, ValidationPipe } from '@nestjs/common';
import { json } from 'express';
import { requestIdMiddleware } from './common/request-id.middleware.js';
import { LoggingInterceptor } from './common/logging.interceptor.js';
import * as Sentry from '@sentry/node';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export async function createApp() {
  const app = await NestFactory.create(AppModule);
  if (process.env.SENTRY_DSN) {
    Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.0 });
  }
  // Capture rawBody for webhook signature verification (e.g., WhatsApp/Stripe)
  app.use(
    json({
      limit: '1mb',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      verify: (req: any, _res, buf) => {
        // Preserve raw body for HMAC verification
        req.rawBody = buf;
      },
    }),
  );
  app.use(requestIdMiddleware as any);
  // CORS: allow specific origins via CORS_ORIGINS (comma-separated), else localhost:3000 by default
  const originsEnv = process.env.CORS_ORIGINS;
  const defaultOrigins = ['http://localhost:3000'];
  const allowedOrigins = originsEnv
    ? originsEnv.split(',').map((s) => s.trim()).filter(Boolean)
    : defaultOrigins;
  app.enableCors({
    origin: (origin, callback) => {
      // Do not error on disallowed origins; just omit CORS headers
      const ok = !origin || allowedOrigins.includes(origin);
      callback(null, ok);
    },
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new LoggingInterceptor());
  // OpenAPI
  const config = new DocumentBuilder()
    .setTitle('WhatsApp Commerce Concierge API')
    .setDescription('OpenAPI for Orders, Returns, CMS, Checkout, Catalog, and WhatsApp webhook')
    .setVersion('0.1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  // For serverless usage, initialize the app without listening on a port
  await app.init();
  return app;
}

async function bootstrap() {
  // Local/dev entrypoint
  const app = await createApp();
  const port = process.env.PORT || 3001;
  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log(`API up on :${port}`);
}

// Only auto-bootstrap when running as a standalone process
if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'test') {
  // Avoid auto-start inside Vercel serverless function
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  bootstrap();
}
