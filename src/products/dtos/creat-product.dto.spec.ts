import { validate } from 'class-validator';
import { CreatProductDto } from './creat-product.dto';

describe('CreatProductDto validation', () => {
  it('accepts valid product data and rejects a negative price', async () => {
    const valid = Object.assign(new CreatProductDto(), { title: 'Desk lamp', description: 'LED lamp', price: 10 });
    await expect(validate(valid)).resolves.toHaveLength(0);
    const invalid = Object.assign(new CreatProductDto(), { title: 'X', description: 'Lamp', price: -1 });
    expect((await validate(invalid)).length).toBeGreaterThan(0);
  });
});
