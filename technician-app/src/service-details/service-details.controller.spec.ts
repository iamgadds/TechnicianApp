import { Test, TestingModule } from '@nestjs/testing';
import { ServiceDetailsController } from './service-details.controller';

describe('ServiceDetailsController', () => {
  let controller: ServiceDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceDetailsController],
    }).compile();

    controller = module.get<ServiceDetailsController>(ServiceDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
