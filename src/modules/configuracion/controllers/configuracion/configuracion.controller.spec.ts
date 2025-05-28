import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfiguracionController } from './configuracion.controller';
import { ConfiguracionService } from '../../services/configuracion/configuracion.service';

describe('ConfiguracionController', () => {
  let controller: ConfiguracionController;
  let service: ConfiguracionService;

  const mockConfiguracionService = {
    getConfiguracion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfiguracionController],
      providers: [
        {
          provide: ConfiguracionService,
          useValue: mockConfiguracionService,
        },
      ],
    })
      .overrideProvider(ConfiguracionService)
      .useValue(mockConfiguracionService)
      .compile();

    controller = module.get<ConfiguracionController>(ConfiguracionController);
    service = module.get<ConfiguracionService>(ConfiguracionService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('obtenerConfiguracionCompleta', () => {
    it('should return configuracion when idEntidad is provided', async () => {
      const mockResult = { key: 'value' };
      mockConfiguracionService.getConfiguracion.mockResolvedValue(mockResult);
      const result = await controller.obtenerConfiguracionCompleta('entidad1');
      expect(service.getConfiguracion).toHaveBeenCalledWith('entidad1');
      expect(result.data).toEqual(mockResult);
      expect(result.status.statusCode).toBe(200);
    });

    it('should throw BadRequestException if idEntidad is not provided', async () => {
      await expect(controller.obtenerConfiguracionCompleta(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.obtenerConfiguracionCompleta(undefined as any)).rejects.toThrow(
        'El QueryParam idEntidad es requerido',
      );
    });
  });
});
