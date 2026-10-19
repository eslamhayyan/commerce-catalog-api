import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserType } from 'src/utils/enums';
import { CURRENT_USER_KEY } from 'src/utils/constant';
import { UserService } from '../user.service';
import { AuthRolesGuard } from './auth.roles.guard';

describe('AuthRolesGuard', () => {
  let module: TestingModule;
  const context = (authorization?: string) => {
    const handler = () => undefined;
    const request = { headers: { authorization } };
    return {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => handler,
      getClass: () => class Test {},
    } as any;
  };

  const buildModule = async (options: {
    config: object;
    jwtService: { verifyAsync: jest.Mock };
    reflector: {
      getAllAndOverride: (...args: any[]) => UserType[] | undefined;
    };
    userService: { getCurrentUser: jest.Mock };
  }) =>
    Test.createTestingModule({
      providers: [
        AuthRolesGuard,
        { provide: ConfigService, useValue: options.config },
        { provide: JwtService, useValue: options.jwtService },
        { provide: Reflector, useValue: options.reflector },
        { provide: UserService, useValue: options.userService },
      ],
    }).compile();

  it('denies routes without role metadata', async () => {
    module = await buildModule({
      config: {},
      jwtService: { verifyAsync: jest.fn() },
      reflector: { getAllAndOverride: () => undefined },
      userService: { getCurrentUser: jest.fn() },
    });
    const guard = module.get<AuthRolesGuard>(AuthRolesGuard);
    await expect(guard.canActivate(context())).resolves.toBe(false);
  });

  it('authorizes a user with an allowed role and attaches the token payload', async () => {
    const payload = { id: 4, userType: UserType.ADMIN };
    module = await buildModule({
      config: { get: () => 'secret' },
      jwtService: { verifyAsync: jest.fn().mockResolvedValue(payload) },
      reflector: { getAllAndOverride: () => [UserType.ADMIN] },
      userService: {
        getCurrentUser: jest
          .fn()
          .mockResolvedValue({ userType: UserType.ADMIN }),
      },
    });
    const guard = module.get<AuthRolesGuard>(AuthRolesGuard);
    const ctx = context('Bearer valid');
    const request = ctx.switchToHttp().getRequest();
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(request[CURRENT_USER_KEY]).toEqual(payload);
  });

  it('denies a user whose role is not allowed and rejects invalid tokens', async () => {
    const userService = {
      getCurrentUser: jest
        .fn()
        .mockResolvedValue({ userType: UserType.NORMAL_USER }),
    };
    module = await buildModule({
      config: { get: () => 'secret' },
      jwtService: { verifyAsync: jest.fn().mockResolvedValue({ id: 4 }) },
      reflector: { getAllAndOverride: () => [UserType.ADMIN] },
      userService,
    });
    const guard = module.get<AuthRolesGuard>(AuthRolesGuard);
    await expect(guard.canActivate(context('Bearer token'))).resolves.toBe(
      false,
    );

    module = await buildModule({
      config: { get: () => 'secret' },
      jwtService: { verifyAsync: jest.fn().mockRejectedValue(new Error()) },
      reflector: { getAllAndOverride: () => [UserType.ADMIN] },
      userService,
    });
    const broken = module.get<AuthRolesGuard>(AuthRolesGuard);
    await expect(
      broken.canActivate(context('Bearer bad')),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
