import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Logger, ValidationPipe } from '@nestjs/common';
import { json } from 'express';

export async function createApp() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '1mb' }));
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
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
if (process.env.VERCEL !== '1') {
  // Avoid auto-start inside Vercel serverless function
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  bootstrap();
}
