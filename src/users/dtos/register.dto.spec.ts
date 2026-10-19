import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto validation', () => {
  it('accepts valid registration data and rejects malformed email or short password', async () => {
    const valid = Object.assign(new RegisterDto(), {
      email: 'person@example.com',
      password: 'secret1',
      username: 'Sam',
    });
    await expect(validate(valid)).resolves.toHaveLength(0);
    const invalid = Object.assign(new RegisterDto(), {
      email: 'not-an-email',
      password: '123',
    });
    expect((await validate(invalid)).length).toBeGreaterThan(0);
  });
});
