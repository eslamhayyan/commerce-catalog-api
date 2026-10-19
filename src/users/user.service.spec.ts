import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserType } from 'src/utils/enums';
import { User } from './user.entity';
import { AuthProvider } from './auth.provider';
import { UserService } from './user.service';

describe('UserService', () => {
  let module: TestingModule;
  let service: UserService;
  let repository: {
    findOne: jest.Mock;
    find: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };
  let auth: {
    register: jest.Mock;
    login: jest.Mock;
    sendResetPasswordLink: jest.Mock;
    getResetPasswordLink: jest.Mock;
    resetPassword: jest.Mock;
  };

  beforeEach(async () => {
    repository = { findOne: jest.fn(), find: jest.fn(), save: jest.fn(), remove: jest.fn() };
    auth = {
      register: jest.fn(),
      login: jest.fn(),
      sendResetPasswordLink: jest.fn(),
      getResetPasswordLink: jest.fn(),
      resetPassword: jest.fn(),
    };

    module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: repository },
        { provide: AuthProvider, useValue: auth },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('delegates register and login to the auth provider', async () => {
    auth.register.mockResolvedValue({ message: 'registered' });
    auth.login.mockResolvedValue({ accessToken: 'token' });
    await expect(service.register({} as any)).resolves.toEqual({ message: 'registered' });
    await expect(service.login({} as any)).resolves.toEqual({ accessToken: 'token' });
  });

  it('finds users and reports missing ids', async () => {
    repository.findOne.mockResolvedValue({ id: 1 });
    await expect(service.getCurrentUser(1)).resolves.toEqual({ id: 1 });
    repository.findOne.mockResolvedValue(null);
    await expect(service.getCurrentUser(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates username and hashes a changed password', async () => {
    repository.findOne.mockResolvedValue({ id: 1, username: 'old', password: 'hash' });
    repository.save.mockImplementation(async (value) => value);
    const updated = await service.update(1, { username: 'new', password: 'new-password' } as any);
    expect(updated.username).toBe('new');
    expect(updated.password).not.toBe('new-password');
  });

  it('allows self deletion and blocks unauthorized deletion', async () => {
    repository.findOne.mockResolvedValue({ id: 1 });
    await expect(service.delete(1, { id: 1 } as any)).resolves.toEqual({ message: 'user deleted' });
    await expect(service.delete(1, { id: 2, userType: UserType.NORMAL_USER } as any)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('verifies an email with the matching token', async () => {
    const user = { id: 1, verificationToken: 'token', isAcountVarified: false };
    repository.findOne.mockResolvedValue(user);
    repository.save.mockImplementation(async (value) => value);
    await expect(service.verifyEmail(1, 'token')).resolves.toEqual({ message: 'Email verified successfully' });
    expect(user.isAcountVarified).toBe(true);
    expect(user.verificationToken).toBeNull();
  });
});
