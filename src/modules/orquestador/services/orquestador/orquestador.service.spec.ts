import { Test, TestingModule } from '@nestjs/testing';
import { OrquestadorService } from './orquestador.service';

describe('OrquestadorService', () => {
  let service: OrquestadorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrquestadorService],
    }).compile();

    service = module.get<OrquestadorService>(OrquestadorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
