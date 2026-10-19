import { Test, TestingModule } from '@nestjs/testing';
import { lastValueFrom, of } from 'rxjs';
import { LoggerInterceptor } from './logger.interceptor';

describe('LoggerInterceptor', () => {
  let module: TestingModule;
  let interceptor: LoggerInterceptor;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [LoggerInterceptor],
    }).compile();

    interceptor = module.get<LoggerInterceptor>(LoggerInterceptor);
  });

  it('removes password fields from handler results', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const result = await lastValueFrom(interceptor.intercept({} as any, { handle: () => of({ id: 1, password: 'secret', username: 'user' }) } as any) as any);
    expect(result).toEqual({ id: 1, username: 'user' });
    log.mockRestore();
  });
});
