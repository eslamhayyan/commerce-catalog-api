import { Test, TestingModule } from '@nestjs/testing';

jest.mock('fs', () => ({ ...jest.requireActual('fs'), existsSync: jest.fn(), mkdirSync: jest.fn() }));
import { existsSync } from 'fs';
import { UploadController } from './uploads.controller';

describe('UploadController', () => {
  let module: TestingModule;
  let controller: UploadController;
  let log: jest.SpyInstance;

  beforeAll(async () => {
    log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterAll(() => log.mockRestore());

  beforeEach(async () => {
    jest.clearAllMocks();
    module = await Test.createTestingModule({
      controllers: [UploadController],
    }).compile();

    controller = module.get<UploadController>(UploadController);
  });

  it('returns uploaded file details and rejects missing files', () => {
    expect(controller.uploadFile({ filename: 'file.png', path: 'images/file.png' } as any)).toEqual({ message: 'File uploaded successfully', fileName: 'file.png', filePath: 'images/file.png' });
    expect(() => controller.uploadFile(undefined as any)).toThrow('File not found');
  });

  it('accepts a non-empty file collection and rejects an empty one', () => {
    expect(controller.uploadMultipleFiles([{ filename: 'a.png' }] as any)).toEqual({ message: 'Files uploaded successfully' });
    expect(() => controller.uploadMultipleFiles([])).toThrow('No files found');
  });

  it('sends an existing upload and returns not found for an unknown path', () => {
    (existsSync as jest.Mock).mockReturnValue(true);
    const response = { sendFile: jest.fn() } as any;
    controller.showUploadedImage('photo.png', response);
    expect(response.sendFile).toHaveBeenCalledWith('photo.png', { root: './images' });
    (existsSync as jest.Mock).mockReturnValue(false);
    expect(() => controller.showUploadedImage('missing.png', response)).toThrow('Image not found');
  });
});
