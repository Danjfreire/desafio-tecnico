import { Test, TestingModule } from '@nestjs/testing';
import { LegacyOrderService } from './legacy-order.service';

describe('LegacyOrderService', () => {
  let service: LegacyOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LegacyOrderService],
    }).compile();

    service = module.get<LegacyOrderService>(LegacyOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
