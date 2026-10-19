import { UserController } from './user.controller';

describe('UserController', () => {
  let controller: UserController; let service: any;
  beforeEach(() => {
    service = { register: jest.fn(), login: jest.fn(), getCurrentUser: jest.fn(), getAll: jest.fn(), update: jest.fn(), delete: jest.fn(), setProfileImage: jest.fn(), removeProfileImage: jest.fn(), verifyEmail: jest.fn(), sendResetPassword: jest.fn(), getResetPassword: jest.fn(), resetPassword: jest.fn() };
    controller = new UserController(service);
  });
  it('forwards registration, login, user listing, and current user requests', () => {
    const dto = {} as any; const user = { id: 2 } as any;
    controller.register(dto); controller.login(dto); controller.getAllUsers(); controller.getCurrentUser(user);
    expect(service.register).toHaveBeenCalledWith(dto); expect(service.login).toHaveBeenCalledWith(dto);
    expect(service.getAll).toHaveBeenCalled(); expect(service.getCurrentUser).toHaveBeenCalledWith(2);
  });
  it('forwards profile, account, email verification, and password recovery requests', () => {
    const user = { id: 2 } as any; const dto = {} as any;
    controller.updateUser(user, dto); controller.deleteUser(2, user); controller.uploadProfileImage(user, { filename: 'avatar.png' } as any);
    controller.removeProfileImage(user); controller.verifyEmail(2, 'verify'); controller.forgetPassword({ email: 'a@b.com' } as any);
    controller.getResetPassword(2, 'reset-token'); controller.resetPassword(dto);
    expect(service.update).toHaveBeenCalledWith(2, dto); expect(service.delete).toHaveBeenCalledWith(2, user);
    expect(service.setProfileImage).toHaveBeenCalledWith(2, 'avatar.png'); expect(service.removeProfileImage).toHaveBeenCalledWith(2);
    expect(service.verifyEmail).toHaveBeenCalledWith(2, 'verify'); expect(service.sendResetPassword).toHaveBeenCalledWith('a@b.com');
    expect(service.getResetPassword).toHaveBeenCalledWith(2, 'reset-token'); expect(service.resetPassword).toHaveBeenCalledWith(dto);
  });
  it('rejects profile image uploads without a file', () => {
    expect(() => controller.uploadProfileImage({ id: 2 } as any, undefined as any)).toThrow('File not found');
  });
});
