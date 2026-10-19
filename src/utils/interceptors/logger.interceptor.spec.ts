import { LoggerInterceptor } from './logger.interceptor';
import { lastValueFrom, of } from 'rxjs';

describe('LoggerInterceptor', () => {
  it('removes password fields from handler results', async () => {
    const interceptor = new LoggerInterceptor(); const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const result = await lastValueFrom(interceptor.intercept({} as any, { handle: () => of({ id: 1, password: 'secret', username: 'user' }) } as any) as any);
    expect(result).toEqual({ id: 1, username: 'user' }); log.mockRestore();
  });
});
