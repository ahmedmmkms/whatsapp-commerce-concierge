import type { VercelRequest, VercelResponse } from '@vercel/node';
import serverlessExpress from '@vendia/serverless-express';
import { createApp } from '../src/main';

let cachedHandler: ReturnType<typeof serverlessExpress> | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!cachedHandler) {
    const nestApp = await createApp();
    const expressApp = nestApp.getHttpAdapter().getInstance();
    cachedHandler = serverlessExpress({ app: expressApp });
  }
  return cachedHandler!(req as any, res as any);
}

