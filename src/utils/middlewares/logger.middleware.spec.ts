import { Test, TestingModule } from '@nestjs/testing';
import { LoggerMiddleware } from './logger.middleware';

describe('LoggerMiddleware', () => {
  let module: TestingModule;
  let middleware: LoggerMiddleware;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [LoggerMiddleware],
    }).compile();

    middleware = module.get<LoggerMiddleware>(LoggerMiddleware);
  });

  it('logs request metadata and calls next', () => {
    const next = jest.fn();
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    middleware.use({ headers: {}, method: 'GET', hostname: 'localhost' } as any, {} as any, next);
    expect(log).toHaveBeenCalledWith({ headers: {}, method: 'GET', hostname: 'localhost' });
    expect(next).toHaveBeenCalled();
    log.mockRestore();
  });
});
