import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './guards/auth.guard';
import { AuthRolesGuard } from './guards/auth.roles.guard';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let module: TestingModule;
  let controller: UserController;
  let service: {
    register: jest.Mock;
    login: jest.Mock;
    getCurrentUser: jest.Mock;
    getAll: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    setProfileImage: jest.Mock;
    removeProfileImage: jest.Mock;
    verifyEmail: jest.Mock;
    sendResetPassword: jest.Mock;
    getResetPassword: jest.Mock;
    resetPassword: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      register: jest.fn(),
      login: jest.fn(),
      getCurrentUser: jest.fn(),
      getAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      setProfileImage: jest.fn(),
      removeProfileImage: jest.fn(),
      verifyEmail: jest.fn(),
      sendResetPassword: jest.fn(),
      getResetPassword: jest.fn(),
      resetPassword: jest.fn(),
    };

    module = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: service }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AuthRolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it('forwards registration, login, user listing, and current user requests', () => {
    const dto = {} as any;
    const user = { id: 2 } as any;
    controller.register(dto);
    controller.login(dto);
    controller.getAllUsers();
    controller.getCurrentUser(user);
    expect(service.register).toHaveBeenCalledWith(dto);
    expect(service.login).toHaveBeenCalledWith(dto);
    expect(service.getAll).toHaveBeenCalled();
    expect(service.getCurrentUser).toHaveBeenCalledWith(2);
  });

  it('forwards profile, account, email verification, and password recovery requests', () => {
    const user = { id: 2 } as any;
    const dto = {} as any;
    controller.updateUser(user, dto);
    controller.deleteUser(2, user);
    controller.uploadProfileImage(user, { filename: 'avatar.png' } as any);
    controller.removeProfileImage(user);
    controller.verifyEmail(2, 'verify');
    controller.forgetPassword({ email: 'a@b.com' } as any);
    controller.getResetPassword(2, 'reset-token');
    controller.resetPassword(dto);
    expect(service.update).toHaveBeenCalledWith(2, dto);
    expect(service.delete).toHaveBeenCalledWith(2, user);
    expect(service.setProfileImage).toHaveBeenCalledWith(2, 'avatar.png');
    expect(service.removeProfileImage).toHaveBeenCalledWith(2);
    expect(service.verifyEmail).toHaveBeenCalledWith(2, 'verify');
    expect(service.sendResetPassword).toHaveBeenCalledWith('a@b.com');
    expect(service.getResetPassword).toHaveBeenCalledWith(2, 'reset-token');
    expect(service.resetPassword).toHaveBeenCalledWith(dto);
  });

  it('rejects profile image uploads without a file', () => {
    expect(() =>
      controller.uploadProfileImage({ id: 2 } as any, undefined as any),
    ).toThrow('File not found');
  });
});
