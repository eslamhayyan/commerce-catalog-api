import { LoggerMiddleware } from './logger.middleware';

describe('LoggerMiddleware', () => {
  it('logs request metadata and calls next', () => {
    const middleware = new LoggerMiddleware(); const next = jest.fn();
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    middleware.use({ headers: {}, method: 'GET', hostname: 'localhost' } as any, {} as any, next);
    expect(log).toHaveBeenCalledWith({ headers: {}, method: 'GET', hostname: 'localhost' }); expect(next).toHaveBeenCalled(); log.mockRestore();
  });
});
