import { Test, TestingModule } from '@nestjs/testing';
import { OrquestadorController } from './orquestador.controller';
import { OrquestadorService } from '../../services/orquestador/orquestador.service';
import { DynamicOperationDto } from '../../dto/dynamic-operation.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { BadRequestException } from '@nestjs/common';

describe('OrquestadorController', () => {
  let controller: OrquestadorController;
  let mockOrquestadorService: { ejecutarOperacion: jest.Mock; checkTemplateHealth: jest.Mock };

  beforeEach(async () => {
    mockOrquestadorService = {
      ejecutarOperacion: jest.fn(),
      checkTemplateHealth: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrquestadorController],
      providers: [
        {
          provide: OrquestadorService,
          useValue: mockOrquestadorService,
        },
      ],
    })
      .overrideProvider(OrquestadorService)
      .useValue(mockOrquestadorService)
      .compile();

    controller = module.get<OrquestadorController>(OrquestadorController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('ejecutarOperacion', () => {
    it('should call service and return its result', async () => {
      const dto: DynamicOperationDto = { operacion: 'test' } as any;
      const serviceResult = new ResponseDto({ ok: true });
      mockOrquestadorService.ejecutarOperacion.mockResolvedValue(serviceResult);
      const result = await controller.ejecutarOperacion(dto);
      expect(result).toBe(serviceResult);
      expect(mockOrquestadorService.ejecutarOperacion).toHaveBeenCalledWith(dto);
    });
  });

  describe('checkHealth', () => {
    it('should call service and return its result', async () => {
      const endPoint = 'http://test';
      const serviceResult = new ResponseDto({ healthy: true });
      mockOrquestadorService.checkTemplateHealth.mockResolvedValue(serviceResult);
      const result = await controller.checkHealth(endPoint);
      expect(result).toBe(serviceResult);
      expect(mockOrquestadorService.checkTemplateHealth).toHaveBeenCalledWith(endPoint);
    });

    it('should throw BadRequestException if endPoint is missing', async () => {
      await expect(controller.checkHealth(undefined as any)).rejects.toThrow(BadRequestException);
    });
  });
});
