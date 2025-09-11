import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AdminTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const token = req.headers['x-admin-token'] as string | undefined;
    const expected = process.env.ADMIN_TOKEN || process.env.CMS_ADMIN_TOKEN;
    return Boolean(expected && token && token === expected);
  }
}

