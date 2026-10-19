import { RequestTimeoutException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';

describe('MailService', () => {
  let module: TestingModule;
  let service: MailService;
  let mailer: { sendMail: jest.Mock };

  beforeEach(async () => {
    mailer = { sendMail: jest.fn().mockResolvedValue(undefined) };

    module = await Test.createTestingModule({
      providers: [MailService, { provide: MailerService, useValue: mailer }],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('sends a login notification with the recipient and date', async () => {
    await service.sendLoginEmail('person@example.com');
    expect(mailer.sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: 'person@example.com', template: 'login', context: expect.objectContaining({ email: 'person@example.com', today: expect.any(Date) }) }));
  });

  it('sends verification and reset password templates', async () => {
    await service.sendVerifyEmailTemplate('a@b.com', 'https://example.test/verify');
    await service.resetPasswordTemplate('a@b.com', 'https://example.test/reset');
    expect(mailer.sendMail).toHaveBeenNthCalledWith(1, expect.objectContaining({ template: 'verify-email', context: { email: 'a@b.com', link: 'https://example.test/verify' } }));
    expect(mailer.sendMail).toHaveBeenNthCalledWith(2, expect.objectContaining({ template: 'reset-password', context: { resetPasswordLink: 'https://example.test/reset' } }));
  });

  it('converts mail transport failures to a timeout exception', async () => {
    mailer.sendMail.mockRejectedValue(new Error('smtp unavailable'));
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(service.sendLoginEmail('a@b.com')).rejects.toBeInstanceOf(RequestTimeoutException);
    error.mockRestore();
  });
});
