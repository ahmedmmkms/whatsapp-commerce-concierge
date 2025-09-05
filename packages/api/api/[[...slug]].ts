import serverlessExpress from '@vendia/serverless-express';
import { createApp } from '../src/main';

let cachedHandler: ReturnType<typeof serverlessExpress> | null = null;

export default async function handler(req: any, res: any) {
  if (!cachedHandler) {
    const nestApp = await createApp();
    const expressApp = nestApp.getHttpAdapter().getInstance();
    cachedHandler = serverlessExpress({ app: expressApp });
  }
  return cachedHandler!(req as any, res as any);
}
