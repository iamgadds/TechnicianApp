import { Test, TestingModule } from '@nestjs/testing';
import { ServiceDetailsService } from './service-details.service';

describe('ServiceDetailsService', () => {
  let service: ServiceDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceDetailsService],
    }).compile();

    service = module.get<ServiceDetailsService>(ServiceDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
