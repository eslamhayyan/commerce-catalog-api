import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductService } from 'src/products/products.service';
import { UserService } from 'src/users/user.service';
import { UserType } from 'src/utils/enums';
import { Review } from './reviews.entity';
import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  let module: TestingModule;
  let service: ReviewsService;
  let repository: {
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    remove: jest.Mock;
  };
  let users: { getCurrentUser: jest.Mock };
  let products: { getOneBy: jest.Mock };

  beforeEach(async () => {
    repository = {
      find: jest.fn(),
      create: jest.fn((value) => value),
      save: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };
    users = { getCurrentUser: jest.fn().mockResolvedValue({ id: 2 }) };
    products = { getOneBy: jest.fn().mockResolvedValue({ id: 3 }) };

    module = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: getRepositoryToken(Review), useValue: repository },
        { provide: UserService, useValue: users },
        { provide: ProductService, useValue: products },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  it('paginates reviews in descending creation order', async () => {
    repository.find.mockResolvedValue([]);
    await service.getAllReviews(2, 10);
    expect(repository.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' }, skip: 10, take: 10 });
  });

  it('creates a review and returns related ids', async () => {
    repository.save.mockResolvedValue({ id: 5, comment: 'Nice', rating: 5, createdAt: new Date(), user: { id: 2 }, product: { id: 3 } });
    await expect(service.createReview(2, 3, { comment: 'Nice', rating: 5 } as any)).resolves.toMatchObject({ id: 5, userId: 2, productId: 3 });
  });

  it('updates a review only for its owner', async () => {
    const review = { id: 5, comment: 'old', rating: 2, user: { id: 2 } };
    repository.findOne.mockResolvedValue(review);
    repository.save.mockImplementation(async (value) => value);
    await expect(service.updateReview(5, 2, { comment: 'updated' } as any)).resolves.toMatchObject({ comment: 'updated' });
    await expect(service.updateReview(5, 9, {} as any)).rejects.toThrow('not authorized');
  });

  it('allows the owner to delete and forbids an unrelated admin', async () => {
    const review = { id: 5, user: { id: 2 } };
    repository.findOne.mockResolvedValue(review);
    await expect(service.deleteReview(5, { id: 2, userType: UserType.NORMAL_USER } as any)).resolves.toEqual({ message: 'Review deleted successfully' });
    await expect(service.deleteReview(5, { id: 9, userType: UserType.ADMIN } as any)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
