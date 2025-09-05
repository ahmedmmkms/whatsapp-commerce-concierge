import { createApp } from '../src/main.js';

let cachedExpressApp: any = null;

export default async function handler(req: any, res: any) {
  if (!cachedExpressApp) {
    const nestApp = await createApp();
    cachedExpressApp = nestApp.getHttpAdapter().getInstance();
  }
  return cachedExpressApp(req, res);
}
