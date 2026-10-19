import { validate } from 'class-validator';
import { CreateReviewDto } from './create-review.dto';

describe('CreateReviewDto validation', () => {
  it('accepts a valid rating and comment and rejects out-of-range ratings', async () => {
    const valid = Object.assign(new CreateReviewDto(), {
      rating: 5,
      comment: 'Excellent product',
    });
    await expect(validate(valid)).resolves.toHaveLength(0);
    const invalid = Object.assign(new CreateReviewDto(), {
      rating: 6,
      comment: 'x',
    });
    expect((await validate(invalid)).length).toBeGreaterThan(0);
  });
});
