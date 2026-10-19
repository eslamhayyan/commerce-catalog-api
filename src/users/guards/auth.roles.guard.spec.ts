import { BadRequestException } from '@nestjs/common';
import { AuthRolesGuard } from './auth.roles.guard';
import { UserType } from 'src/utils/enums';
import { CURRENT_USER_KEY } from 'src/utils/constant';

describe('AuthRolesGuard', () => {
  const context = (authorization?: string) => {
    const handler = () => undefined;
    const request = { headers: { authorization } };
    return { switchToHttp: () => ({ getRequest: () => request }), getHandler: () => handler, getClass: () => class Test {} } as any;
  };
  it('denies routes without role metadata', async () => {
    const guard = new AuthRolesGuard({} as any, {} as any, { getAllAndOverride: () => undefined } as any, {} as any);
    await expect(guard.canActivate(context())).resolves.toBe(false);
  });
  it('authorizes a user with an allowed role and attaches the token payload', async () => {
    const payload = { id: 4, userType: UserType.ADMIN };
    const guard = new AuthRolesGuard({ get: () => 'secret' } as any, { verifyAsync: jest.fn().mockResolvedValue(payload) } as any, { getAllAndOverride: () => [UserType.ADMIN] } as any, { getCurrentUser: jest.fn().mockResolvedValue({ userType: UserType.ADMIN }) } as any);
    const ctx = context('Bearer valid'); const request = ctx.switchToHttp().getRequest();
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(request[CURRENT_USER_KEY]).toEqual(payload);
  });
  it('denies a user whose role is not allowed and rejects invalid tokens', async () => {
    const userService = { getCurrentUser: jest.fn().mockResolvedValue({ userType: UserType.NORMAL_USER }) };
    const guard = new AuthRolesGuard({ get: () => 'secret' } as any, { verifyAsync: jest.fn().mockResolvedValue({ id: 4 }) } as any, { getAllAndOverride: () => [UserType.ADMIN] } as any, userService as any);
    await expect(guard.canActivate(context('Bearer token'))).resolves.toBe(false);
    const broken = new AuthRolesGuard({ get: () => 'secret' } as any, { verifyAsync: jest.fn().mockRejectedValue(new Error()) } as any, { getAllAndOverride: () => [UserType.ADMIN] } as any, userService as any);
    await expect(broken.canActivate(context('Bearer bad'))).rejects.toBeInstanceOf(BadRequestException);
  });
});
