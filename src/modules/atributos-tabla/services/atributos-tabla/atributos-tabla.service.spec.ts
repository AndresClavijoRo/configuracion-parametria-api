import { Test, TestingModule } from '@nestjs/testing';
import { AtributosTablaService } from './atributos-tabla.service';

describe('AtributosTablaService', () => {
  let service: AtributosTablaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AtributosTablaService],
    }).compile();

    service = module.get<AtributosTablaService>(AtributosTablaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
