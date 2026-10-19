import { Test, TestingModule } from '@nestjs/testing';
import { AuthRolesGuard } from 'src/users/guards/auth.roles.guard';
import { ProductController } from './product.controller';
import { ProductService } from './products.service';

describe('ProductController', () => {
  let module: TestingModule;
  let controller: ProductController;
  let service: {
    CreatProduct: jest.Mock;
    getAll: jest.Mock;
    getOneBy: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      CreatProduct: jest.fn(),
      getAll: jest.fn(),
      getOneBy: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    module = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductService, useValue: service }],
    })
      .overrideGuard(AuthRolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProductController>(ProductController);
  });

  it('forwards product creation and list filters', () => {
    const dto = { title: 'Desk', price: 10 } as any;
    const user = { id: 3 } as any;
    controller.CreatNewProduct(dto, user);
    controller.getAllProduct('Desk', '5', '20');
    expect(service.CreatProduct).toHaveBeenCalledWith(dto, 3);
    expect(service.getAll).toHaveBeenCalledWith('Desk', '5', '20');
  });

  it('forwards product reads, updates, and deletes', () => {
    controller.getSingleProduct(4);
    controller.updateProduct(4, {} as any);
    controller.deleteProduct(4);
    expect(service.getOneBy).toHaveBeenCalledWith(4);
    expect(service.update).toHaveBeenCalledWith(4, {});
    expect(service.delete).toHaveBeenCalledWith(4);
  });
});
