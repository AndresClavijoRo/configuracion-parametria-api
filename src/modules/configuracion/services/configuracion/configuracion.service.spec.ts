import { Test, TestingModule } from '@nestjs/testing';
import { ConfiguracionService } from './configuracion.service';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Modulo } from 'src/modules/modulo/schemas/modulo.schema';

describe('ConfiguracionService', () => {
  let service: ConfiguracionService;
  let mockModuloModel: any;

  beforeEach(async () => {
    mockModuloModel = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfiguracionService,
        {
          provide: 'ModuloModel',
          useValue: mockModuloModel,
        },
      ],
    }).compile();

    service = module.get<ConfiguracionService>(ConfiguracionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getConfiguracion', () => {
    it('debería retornar el módulo filtrando la entidad', async () => {
      const idEntidad = new Types.ObjectId().toString();
      const moduloMock = {
        entidades: [
          { _id: new Types.ObjectId(idEntidad), nombre: 'Entidad1' },
          { _id: new Types.ObjectId(), nombre: 'OtraEntidad' },
        ],
        toObject: jest
          .fn()
          .mockReturnValue({ entidades: [{ _id: idEntidad, nombre: 'Entidad1' }] }),
      };
      mockModuloModel.findOne.mockResolvedValue(moduloMock);

      const result = await service.getConfiguracion(idEntidad);
      if ('entidades' in result) {
        expect(Array.isArray(result.entidades)).toBe(true);
        expect(result.entidades.length).toBe(1);
        expect(result.entidades[0]?._id?.toString()).toBe(idEntidad);
      } else {
        throw new Error('No se retornó el módulo esperado');
      }
    });

    it('debería retornar mensaje si no encuentra el módulo', async () => {
      mockModuloModel.findOne.mockResolvedValue(null);
      const idEntidad = new Types.ObjectId().toString();
      const result = await service.getConfiguracion(idEntidad);
      expect(result).toEqual({ response: null, mensaje: 'Modulo no encontrado' });
    });
  });
});
