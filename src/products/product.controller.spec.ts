import { ProductController } from './product.controller';

describe('ProductController', () => {
  let controller: ProductController;
  let service: any;
  beforeEach(() => { service = { CreatProduct: jest.fn(), getAll: jest.fn(), getOneBy: jest.fn(), update: jest.fn(), delete: jest.fn() }; controller = new ProductController(service); });
  it('forwards product creation and list filters', () => {
    const dto = { title: 'Desk', price: 10 } as any; const user = { id: 3 } as any;
    controller.CreatNewProduct(dto, user);
    controller.getAllProduct('Desk', '5', '20');
    expect(service.CreatProduct).toHaveBeenCalledWith(dto, 3);
    expect(service.getAll).toHaveBeenCalledWith('Desk', '5', '20');
  });
  it('forwards product reads, updates, and deletes', () => {
    controller.getSingleProduct(4); controller.updateProduct(4, {} as any); controller.deleteProduct(4);
    expect(service.getOneBy).toHaveBeenCalledWith(4); expect(service.update).toHaveBeenCalledWith(4, {}); expect(service.delete).toHaveBeenCalledWith(4);
  });
});
