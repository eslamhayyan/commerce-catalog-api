import { ReviewsController } from './reviews.controller';

describe('ReviewsController', () => {
  let controller: ReviewsController; let service: any;
  beforeEach(() => { service = { getAllReviews: jest.fn(), createReview: jest.fn(), updateReview: jest.fn(), deleteReview: jest.fn() }; controller = new ReviewsController(service); });
  it('forwards review creation with authenticated user and product ids', () => {
    const dto = { rating: 5 } as any; controller.createNewReview(6, dto, { id: 2 } as any);
    expect(service.createReview).toHaveBeenCalledWith(2, 6, dto);
  });
  it('forwards list, update, and delete calls', () => {
    controller.getAllReviews(2, 10); controller.UpdateReview(9, {} as any, { id: 3 } as any); controller.deleteReview(9, { id: 3 } as any);
    expect(service.getAllReviews).toHaveBeenCalledWith(2, 10); expect(service.updateReview).toHaveBeenCalledWith(9, 3, {}); expect(service.deleteReview).toHaveBeenCalledWith(9, { id: 3 });
  });
});
