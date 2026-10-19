import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CURRENT_USER_KEY } from 'src/utils/constant';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let module: TestingModule;
  const context = (authorization?: string) => {
    const request = { headers: { authorization } };
    return { switchToHttp: () => ({ getRequest: () => request }) } as any;
  };

  const buildModule = async (jwtService: { verifyAsync: jest.Mock }) =>
    Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: ConfigService, useValue: { get: () => 'secret' } },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

  it('verifies a bearer token and attaches its payload to the request', async () => {
    module = await buildModule({ verifyAsync: jest.fn().mockResolvedValue({ id: 4 }) });
    const guard = module.get<AuthGuard>(AuthGuard);
    const ctx = context('Bearer token');
    const req = ctx.switchToHttp().getRequest();
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(req[CURRENT_USER_KEY]).toEqual({ id: 4 });
  });

  it('rejects missing, malformed, and invalid tokens', async () => {
    module = await buildModule({ verifyAsync: jest.fn().mockRejectedValue(new Error()) });
    const guard = module.get<AuthGuard>(AuthGuard);
    await expect(guard.canActivate(context())).rejects.toBeInstanceOf(BadRequestException);
    await expect(guard.canActivate(context('Basic token'))).rejects.toBeInstanceOf(BadRequestException);
    await expect(guard.canActivate(context('Bearer token'))).rejects.toBeInstanceOf(BadRequestException);
  });
});
