import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from 'src/users/user.service';
import { Like, Between } from 'typeorm';
import { Product } from './products.entity';
import { ProductService } from './products.service';

describe('ProductService', () => {
  let module: TestingModule;
  let service: ProductService;
  let repository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    remove: jest.Mock;
  };
  let users: { getCurrentUser: jest.Mock };

  beforeEach(async () => {
    repository = {
      create: jest.fn((value) => value),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };
    users = { getCurrentUser: jest.fn().mockResolvedValue({ id: 7 }) };

    module = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: getRepositoryToken(Product), useValue: repository },
        { provide: UserService, useValue: users },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('creates a product with a normalized title and its owner', async () => {
    repository.save.mockImplementation(async (value) => value);
    await expect(service.CreatProduct({ title: 'Desk Lamp', description: 'lamp', price: 12 } as any, 7))
      .resolves.toMatchObject({ title: 'desk lamp', user: { id: 7 } });
  });

  it('lists products with optional title and price filters', async () => {
    repository.find.mockResolvedValue([]);
    await service.getAll('Lamp', '10', '20');
    expect(repository.find).toHaveBeenCalledWith({ where: { title: Like('%lamp%'), price: Between(10, 20) } });
    await service.getAll();
    expect(repository.find).toHaveBeenLastCalledWith({ where: {} });
  });

  it('returns a product by id and throws when it is missing', async () => {
    repository.findOne.mockResolvedValue({ id: 1 });
    await expect(service.getOneBy(1)).resolves.toEqual({ id: 1 });
    repository.findOne.mockResolvedValue(null);
    await expect(service.getOneBy(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates supplied fields and deletes an existing product', async () => {
    const product = { id: 1, title: 'old', description: 'old', price: 1 };
    repository.findOne.mockResolvedValue(product);
    repository.save.mockImplementation(async (value) => value);
    await expect(service.update(1, { title: 'new' } as any)).resolves.toMatchObject({ title: 'new', price: 1 });
    await expect(service.delete(1)).resolves.toEqual({ message: 'deleted' });
    expect(repository.remove).toHaveBeenCalledWith(product);
  });
});
