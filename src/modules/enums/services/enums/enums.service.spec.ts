import { Test, TestingModule } from '@nestjs/testing';
import { EnumsService } from './enums.service';

describe('EnumsService', () => {
  let service: EnumsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnumsService],
    }).compile();

    service = module.get<EnumsService>(EnumsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all enums in getEnums', () => {
    const result = service.getEnums();
    expect(result.response).toHaveProperty('tipoConexion');
    expect(result.response).toHaveProperty('tipoDato');
    expect(result.response).toHaveProperty('tipoOperacion');
    expect(Array.isArray(result.response.tipoConexion)).toBe(true);
    expect(Array.isArray(result.response.tipoDato)).toBe(true);
    expect(Array.isArray(result.response.tipoOperacion)).toBe(true);
  });

  it('should return tipoConexion enum in getEnum', () => {
    const result = service.getEnum('tipoConexion');
    expect(result.response).toBeDefined();
    expect(Array.isArray(result.response)).toBe(true);
  });

  it('should return tipoDato enum in getEnum', () => {
    const result = service.getEnum('tipoDato');
    expect(result.response).toBeDefined();
    expect(Array.isArray(result.response)).toBe(true);
  });

  it('should return tipoOperacion enum in getEnum', () => {
    const result = service.getEnum('tipoOperacion');
    expect(result.response).toBeDefined();
    expect(Array.isArray(result.response)).toBe(true);
  });

  it('should throw error for invalid enum name in getEnum', () => {
    expect(() => service.getEnum('invalidEnum')).toThrowError(/Enum invalidEnum no encontrado/);
  });
});
