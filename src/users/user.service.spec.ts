import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserType } from 'src/utils/enums';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let repository: any;
  let auth: any;
  beforeEach(() => {
    repository = { findOne: jest.fn(), find: jest.fn(), save: jest.fn(), remove: jest.fn() };
    auth = { register: jest.fn(), login: jest.fn(), sendResetPasswordLink: jest.fn(), getResetPasswordLink: jest.fn(), resetPassword: jest.fn() };
    service = new UserService(repository, auth);
  });
  it('delegates register and login to the auth provider', async () => {
    auth.register.mockResolvedValue({ message: 'registered' }); auth.login.mockResolvedValue({ accessToken: 'token' });
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
    repository.findOne.mockResolvedValue(user); repository.save.mockImplementation(async (value) => value);
    await expect(service.verifyEmail(1, 'token')).resolves.toEqual({ message: 'Email verified successfully' });
    expect(user.isAcountVarified).toBe(true); expect(user.verificationToken).toBeNull();
  });
});
