import { BadRequestException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { CURRENT_USER_KEY } from 'src/utils/constant';

describe('AuthGuard', () => {
  const context = (authorization?: string) => {
    const request = { headers: { authorization } };
    return { switchToHttp: () => ({ getRequest: () => request }) } as any;
  };
  it('verifies a bearer token and attaches its payload to the request', async () => {
    const guard = new AuthGuard({ get: () => 'secret' } as any, { verifyAsync: jest.fn().mockResolvedValue({ id: 4 }) } as any);
    const ctx = context('Bearer token'); const req = ctx.switchToHttp().getRequest();
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(req[CURRENT_USER_KEY]).toEqual({ id: 4 });
  });
  it('rejects missing, malformed, and invalid tokens', async () => {
    const guard = new AuthGuard({ get: () => 'secret' } as any, { verifyAsync: jest.fn().mockRejectedValue(new Error()) } as any);
    await expect(guard.canActivate(context())).rejects.toBeInstanceOf(BadRequestException);
    await expect(guard.canActivate(context('Basic token'))).rejects.toBeInstanceOf(BadRequestException);
    await expect(guard.canActivate(context('Bearer token'))).rejects.toBeInstanceOf(BadRequestException);
  });
});
