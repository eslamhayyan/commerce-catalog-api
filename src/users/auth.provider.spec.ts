import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { MailService } from 'src/mail/mail.service';
import { User } from './user.entity';
import { AuthProvider } from './auth.provider';

describe('AuthProvider', () => {
  let module: TestingModule;
  let provider: AuthProvider;
  let users: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };
  let jwt: { signAsync: jest.Mock };
  let mail: { sendVerifyEmailTemplate: jest.Mock; resetPasswordTemplate: jest.Mock };
  let config: { get: jest.Mock };

  beforeEach(async () => {
    users = { findOne: jest.fn(), create: jest.fn((data) => data), save: jest.fn() };
    jwt = { signAsync: jest.fn().mockResolvedValue('signed-token') };
    mail = {
      sendVerifyEmailTemplate: jest.fn().mockResolvedValue(undefined),
      resetPasswordTemplate: jest.fn().mockResolvedValue(undefined),
    };
    config = { get: jest.fn((key) => (key === 'DOMAIN' ? 'https://api.example.test' : 'https://web.example.test')) };

    module = await Test.createTestingModule({
      providers: [
        AuthProvider,
        { provide: getRepositoryToken(User), useValue: users },
        { provide: JwtService, useValue: jwt },
        { provide: MailService, useValue: mail },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    provider = module.get<AuthProvider>(AuthProvider);
  });

  it('rejects duplicate registration emails', async () => {
    users.findOne.mockResolvedValue({ id: 1 });
    await expect(provider.register({ email: 'a@b.com', password: 'secret' } as any)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('registers a user and sends the verification link', async () => {
    users.findOne.mockResolvedValue(null);
    users.save.mockImplementation(async (user) => ({ ...user, id: 4 }));
    await expect(provider.register({ email: 'a@b.com', password: 'secret', username: 'Alice' } as any)).resolves.toHaveProperty('message');
    expect(mail.sendVerifyEmailTemplate).toHaveBeenCalledWith('a@b.com', expect.stringMatching(/\/api\/users\/verify-email\/4\//));
  });

  it('rejects invalid credentials and returns a token for verified users', async () => {
    users.findOne.mockResolvedValue(null);
    await expect(provider.login({ email: 'a@b.com', password: 'wrong' } as any)).rejects.toBeInstanceOf(BadRequestException);
    users.findOne.mockResolvedValue({ id: 1, email: 'a@b.com', password: await bcrypt.hash('secret', 10), isAcountVarified: true, userType: 'normal_user' });
    await expect(provider.login({ email: 'a@b.com', password: 'secret' } as any)).resolves.toEqual({ accessToken: 'signed-token' });
  });

  it('creates unique verification tokens and builds API links', () => {
    expect(provider.generateVerificationToken()).toMatch(/^[a-f0-9]{64}$/);
    expect(provider.genrateLink(3, 'token')).toBe('https://api.example.test/api/users/verify-email/3/token');
  });
});
